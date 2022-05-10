import Vue from "vue";
import Vuex from "vuex";
import Cookie from "js-cookie";

Vue.use(Vuex)

export const state = () => ({
  token: null
})

export const mutations = {
  setToken(state, token) {
    state.token = token;
  },
  clearToken(state) {
    state.token = null;
  }
}

export const actions = {
  nuxtServerInit(vuexContext, context) {
    console.log('nuxtServerInit')
  },
  authenticateUser(vuexContext, authData) {
    console.log('authenticateUser')
  },
  initAuth(vuexContext, req) {
    let token;
    if (req) {
      if (!req.headers.cookie) {
        return;
      }
      const jwtCookie = req.headers.cookie
        .split(";")
        .find(c => c.trim().startsWith(process.env.ACCESS_TOKEN));
      if (!jwtCookie) {
        return;
      }

      token = jwtCookie.split("=")[1];
    } else if (process.client) {

      token = localStorage.getItem(process.env.ACCESS_TOKEN);

    }

    vuexContext.commit("setToken", token);
  },
  logout(vuexContext, context) {

    vuexContext.commit("clearToken");
    Cookie.remove(context.$config.accessToken);

    if (process.client) {
      localStorage.removeItem(context.$config.accessToken);
    }

  }
}

export const getters = {
  isAuthenticated(state) {
    return state.token != null;
  }
}
