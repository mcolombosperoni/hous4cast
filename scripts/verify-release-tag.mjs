#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const tag = process.env.GITHUB_REF_NAME
if (!tag) {
  console.error('GITHUB_REF_NAME is not set')
  process.exit(1)
}

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))
const expectedTag = `release/v${packageJson.version}`

if (tag !== expectedTag) {
  console.error(`Release tag mismatch. Expected ${expectedTag}, received ${tag}`)
  process.exit(1)
}

console.log(`Release tag verified: ${tag}`)

