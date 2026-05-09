import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as { version?: string }

const appVersion = packageJson.version ?? '0.0.0'

/**
 * Vite plugin: injects <meta name="robots" content="noindex,nofollow"> into
 * index.html when VITE_ROBOTS_NOINDEX=true at build time.
 * This prevents search engines from indexing staging / GitHub Pages deployments.
 */
function robotsNoindexPlugin(noindex: boolean): Plugin {
  return {
    name: 'robots-noindex',
    transformIndexHtml(html) {
      if (!noindex) return html
      return html.replace(
        '<meta charset="UTF-8" />',
        '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex,nofollow" />',
      )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const noindex = env.VITE_ROBOTS_NOINDEX === 'true'

  return {
    base: env.VITE_BASE_PATH || '/',
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    plugins: [react(), robotsNoindexPlugin(noindex)],
  }
})
