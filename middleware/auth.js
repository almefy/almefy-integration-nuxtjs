export default function(context) {

  console.log("auth.js - check login status");

  if (context.store.getters.isAuthenticated && context.route.path === process.env.LOGIN_ROUTE) {
    context.redirect(process.env.HOME_ROUTE);
  }

  if (!context.store.getters.isAuthenticated) {
    context.redirect(process.env.LOGIN_ROUTE);
  }

}
