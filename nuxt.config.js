import colors from 'vuetify/es5/util/colors';
// const pkg = require("./package");
import  bodyParser from 'body-parser';
// const axios = require("axios");

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - Weblogin on nuxt.js',
    title: 'Weblogin on nuxt.js',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
    ]
  },
  components: true,
  modules: [
    'cookie-universal-nuxt',
    '@nuxtjs/axios',
  ],
  router: {
    middleware: ['check-auth', 'auth'],
  },
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },
  target: 'server', // default is 'server'
  serverMiddleware: [bodyParser.json(), "~/api"],
  server: {
    port: 3033,
  },
  publicRuntimeConfig: {
    env: process.env.NODE_ENV,
    accessToken: process.env.ACCESS_TOKEN,
    refreshToken: process.env.REFRESH_TOKEN,
    loginRoute: process.env.LOGIN_ROUTE,
    homeRoute: process.env.HOME_ROUTE,
    apiHost: process.env.ALMEFY_APIHOST,
    accessKey: process.env.ALMEFY_KEY,
    enrollmentUrl: process.env.ENROLLMENT_URL,
    authControllerUrl: process.env.CONTROLLER_URL,
    authToken: process.env.CONTROLLER_AUTH_TOKEN,
    mailGlobalMailLocale: process.env.ALMEFY_GLOBAL_MAIL_LOCALE
  },
  privateRuntimeConfig: {
    secretBase64: process.env.ALMEFY_SECRETBASE64,
  },
  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },
}
