require('dotenv').config();

const util = require('util');
const express = require("express");
const { validator } = require('express-validator');
const { check, oneOf, validationResult } = require('express-validator/check');
const router = express.Router();
const app = express();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const CryptoJS = require("crypto-js");

router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
});

function createSignedToken(methodName,url,bodyJson) {
  const mytime = Math.floor(new Date().getTime() / 1000);
  const claim = {
    "iss": process.env.ALMEFY_KEY,
    "aud": process.env.ALMEFY_APIHOST,
    "iat": mytime,
    "nbf": mytime+10,
    "exp": mytime+10,
    "method": methodName,
    "url": process.env.ALMEFY_APIHOST + url,
    "bodyHash": CryptoJS.SHA256(bodyJson).toString()
  };

  const secretKeyBase64 = Buffer.from(process.env.ALMEFY_SECRETBASE64, "base64");
  const signedToken = jwt.sign(claim, secretKeyBase64);
  return signedToken;

}

const validation = [
  oneOf([
      check('email')
        .exists()
        .withMessage('email is required')
        .isLength({ min: 3 })
        .withMessage('email to short'),
      check('email')
        .exists()
        .withMessage('email is required')
        .isEmail()
        .withMessage('email has wrong format'),
  ])
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(`/user-controller/enroll`,  validation, handleValidationErrors, (req, res) => {
  try {

      const email = req.body.email;
      const sendEnrollment = true;

      const bodyJson = JSON.stringify({
        "sendEmail": sendEnrollment,
        "identifier":`${email}`,
        "sendEmailTo":`${email}`,
        "sendEmailLocale":`${process.env.ALMEFY_GLOBAL_MAIL_LOCALE}`
      });
      const url = `${process.env.ALMEFY_APIHOST}/v1/entity/identities/enroll`;
      const signedToken = createSignedToken("POST",url, bodyJson)

      async function run() {
        try {

          const response = await axios.post(url, bodyJson, {
            headers: {
              "Authorization": `Bearer ${signedToken}`,
              "Content-Type": "application/json; charset=utf-8",
            }
          });

          if (response.status===200 || response.status===201) {
            res.status(200).json({message: `Please check your mailbox ${email} and use the Almefy-APP for testing 2-Factor Authentication (2FA) in One Step. Without password!`});
          } else {
            console.log("[API] encrollemnt error", response)
            res.status(400).json({error: "Api returned an error! Error is logged in console"});
          }
        } catch (error) {
          res.status(400).json({error});
          console.log("[API] enrollment error",  (error.response)?error.response:error);

        }
      }
      run();

  }
  catch (error) {
    console.log(error);
    res.status(400).json({error});
  }
});

router.get(`/login-controller`, (req, res) => {

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

            const accessPayload = {
              sub: tokenresult.sub,
            };

            const signOptions = {
              expiresIn: '86400000',
              algorithm: 'HS256',
            }
            const accessToken = jwt.sign(accessPayload, secretKeyBase64, signOptions);

            console.log("[API] challenge successfully completed", accessToken);
            console.log(process.env.ACCESS_TOKEN)
            res.cookie(process.env.ACCESS_TOKEN, accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            });
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
