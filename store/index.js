import Vue from "vue";
import Vuex from "vuex";

import jwt from 'jsonwebtoken';

Vue.use(Vuex)

export const state = () => ({
  token: null,
  payload: null,
});

export const mutations = {
  setToken(state, {token, payload}) {
    state.token = token;
    state.payload = payload;
  },
  clearToken(state) {
    state.token = null;
    state.payload = null;
  },
}

export const actions = {
  nuxtServerInit(vuexContext, context) {
    // console.log('nuxtServerInit called');
  },
  initAuth(vuexContext, context) {

    let token;
    // let payload;
    if (context.req) {

      if (!context.req.headers.cookie) {
        return; // do not process here
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

        const payload = jwt.verify(token, secretKeyBase64, {clockTolerance: 60});
        // console.log("setToken", token, payload);
        vuexContext.commit("setToken", {token, payload});
      } catch (Error) {
        // console.log('for some reason we hit a catch block', Error);
        vuexContext.commit("clearToken");
        this.$axios.get(`${this.$config.authControllerUrl}/logout`);
      }

    }

  },
  logout(vuexContext, context) {

    this.$axios.get(`${this.$config.authControllerUrl}/logout`);
    vuexContext.commit("clearToken");

  }
}

export const getters = {
  isAuthenticated(state) {
    return state.token != null;
  },
  userIdentity(state) {
    return ((state.payload!=null && state.payload.sub!=null)?state.payload.sub:undefined);
  },
  userRole(state) {
    return ((state.payload!=null && state.payload.role!=null)?state.payload.role:undefined);
  }

}
