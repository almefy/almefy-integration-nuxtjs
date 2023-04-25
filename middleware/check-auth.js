export default function(context) {

  // console.log("check-auth.js - dispatch store initAuth");
  context.store.dispatch("initAuth", context);

}
