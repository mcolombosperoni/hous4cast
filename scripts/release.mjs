#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const releaseType = process.argv[2]
const allowed = new Set(['patch', 'minor', 'major'])

if (!allowed.has(releaseType)) {
  console.error('Usage: pnpm release:<patch|minor|major>')
  process.exit(1)
}

const run = (command) => execSync(command, { stdio: 'inherit' })
const runOutput = (command) => execSync(command, { encoding: 'utf-8' }).trim()

const bumpVersion = (version, type) => {
  const [major, minor, patch] = version.split('.').map((part) => Number.parseInt(part, 10))
  if ([major, minor, patch].some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid semver version: ${version}`)
  }

  if (type === 'major') {
    return `${major + 1}.0.0`
  }
  if (type === 'minor') {
    return `${major}.${minor + 1}.0`
  }
  return `${major}.${minor}.${patch + 1}`
}

const tagExists = (tag) => runOutput(`git tag -l ${tag}`) === tag

const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim()
if (status.length > 0) {
  console.error('Working tree is not clean. Commit or stash changes before running release.')
  process.exit(1)
}

const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
if (branch !== 'main') {
  console.error(`Release command must run on main. Current branch: ${branch}`)
  process.exit(1)
}

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))
let version = bumpVersion(packageJson.version, releaseType)
let tag = `release/v${version}`

while (tagExists(tag)) {
  version = bumpVersion(version, releaseType)
  tag = `release/v${version}`
}

run(`pnpm version ${version} --no-git-tag-version`)

run('git add package.json')
run(`git commit -m "chore(release): v${version}"`)
run(`git tag ${tag}`)
run('git push origin main')
run(`git push origin ${tag}`)

console.log(`Release completed: ${tag}`)

