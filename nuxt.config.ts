// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'system',
    fallback: 'light'
  },

  runtimeConfig: {
    // Hanya tersedia di server. Isi lewat NUXT_GROQ_API_KEY di .env.
    groqApiKey: '',
    groqModel: 'openai/gpt-oss-20b',
    public: {
      appName: process.env.APP_NAME || 'Default App'
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        'zod'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
