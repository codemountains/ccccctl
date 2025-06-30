import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ccccctl",
  description: "Claude Code Custom Commands Control - A CLI tool for managing Claude Code Custom slash commands.",
  base: "/ccccctl/",

  head: [
    ['link', { rel: 'icon', href: '/ccccctl/favicon.svg' }],
		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'og:locale', content: 'en' }],
		['meta', { property: 'og:title', content: 'ccccctl' }],
		['meta', { property: 'og:site_name', content: 'ccccctl' }],
		['meta', { property: 'og:url', content: 'https://github.com/codemountains/ccccctl' }],
  ],

  vite: {
    server: {
      host: '0.0.0.0',
      port: 5173
    }
  },
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'CLI Reference', link: '/cli/cli-reference' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Usage', link: '/guide/usage' }
        ]
      },
      {
        text: 'CLI Reference',
        items: [
          { text: 'CLI Commands', link: '/cli/cli-reference' },
          { text: 'Registry', link: '/cli/registry' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/codemountains/ccccctl' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/ccccctl' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 codemountains'
    }
  }
})