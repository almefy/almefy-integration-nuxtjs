import Vue from "vue";
import Vuex from "vuex";
import Cookie from "js-cookie";
import jwt from 'jsonwebtoken';

Vue.use(Vuex)

export const state = () => ({
  token: null
});

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
  initAuth(vuexContext, context) {

    let token;

    if (context.req) {
      if (!context.req.headers.cookie) {
        return;
      }

      const jwtCookie = context.req.headers.cookie
        .split(";")
        .find(c => c.trim().startsWith(process.env.ACCESS_TOKEN));
      if (!jwtCookie) {
        return;
      }

      token = jwtCookie.split("=")[1];

      const secretKeyBase64 = Buffer.from(process.env.ACCESS_SECRETBASE64, "base64");


      try {

        jwt.verify(token, secretKeyBase64, {clockTolerance: 60});
        vuexContext.commit("setToken", token);

      } catch {
        console.log("this token is not valid catch block");
        vuexContext.commit("clearToken");
        console.log(context.$cookies.remove(process.env.ACCESS_TOKEN));

      }

    } else if (process.client) {

      token = localStorage.getItem(process.env.ACCESS_TOKEN);
      // what to do here?
    }


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
