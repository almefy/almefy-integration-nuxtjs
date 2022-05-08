require('dotenv').config();

const express = require("express");
const router = express.Router();
const app = express();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const CryptoJS = require("crypto-js");
// const helper = require("./helper");

router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

router.get(`/login-controller/v1`, (req, res) => {

  try {

    const token = req.get(process.env.CONTROLLER_AUTH_TOKEN);

    if (token) {

      const secretKeyBase64 = Buffer.from(process.env.ALMEFY_SECRETBASE64, "base64");
      const tokenresult = jwt.verify(token, secretKeyBase64, {clockTolerance: 60});

      console.log("[API] JWT Challenge response verifyed - sending OTP", tokenresult);

      const sendUrl = `${tokenresult.iss}/v1/entity/identities/${encodeURIComponent(tokenresult.sub)}/authenticate`;

      const processAuthentificationData = JSON.stringify({ "challenge": tokenresult.jti, "otp": tokenresult.otp });

      const mytime = Math.floor(new Date().getTime() / 1000);
      const bearerPayload = {
        iss: process.env.ALMEFY_KEY,
        aud: process.env.ALMEFY_APIHOST,
        iat: mytime,
        nbf: mytime+10,
        exp: mytime+10,
        method: "POST",
        url: sendUrl,
        bodyHash: CryptoJS.SHA256(processAuthentificationData).toString()
      };

      const signedToken = jwt.sign(bearerPayload, secretKeyBase64);

      async function run() {
        try {

          const result = await axios.post(sendUrl, processAuthentificationData, {
            headers: {
              "Authorization": `Bearer ${signedToken}`,
              "Content-Type": "application/json; charset=utf-8",
            }}
          );

          if (result.status===200) {

            const secretKeyBase64 = Buffer.from(process.env.ACCESS_SECRETBASE64, "base64");
            // const signTime = Math.floor(new Date().getTime() / 1000);

            const accessPayload = {
              sub: tokenresult.sub,
            };

            const signOptions = {
              expiresIn: '86400000',
              algorithm: 'HS256',
          }

            const accessToken = jwt.sign(accessPayload, secretKeyBase64, signOptions);

            console.log("[API] challenge successfully completed", accessToken);
            res.cookie("jwt", accessToken);
            res.json({status: 200, "message" : "OTP correct - access token set as cookie jwt"});


          } else {

            console.log("[API] There was an error - reload challenge", result);
            res.json({status: 400, "message" : "There was an error"});

          }

        } catch (error) {

          console.log("[API] There was an error",  (error.response)?error.response:error);

        }
      }

      run();

    }
  }
  catch (error) {
    console.log(error);
  }
});

module.exports = {
  path: '/api',
  handler: router
}
