require('dotenv').config();

const fs = require("fs");
const express = require("express");
const { check, oneOf, validationResult } = require('express-validator/check');
const router = express.Router();
const app = express();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const CryptoJS = require("crypto-js");

// const admin = require("./admin");

router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
});

function createSignedToken(methodName,urlresult,bodyJson) {
  const iat = Math.floor(new Date().getTime() / 1000);
  const claim = {
    "iss": process.env.ALMEFY_KEY,
    "aud": process.env.ALMEFY_APIHOST,
    iat,
    "nbf": iat,
    "exp": iat+10,
    "method": methodName,
    "url": urlresult,
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
        .withMessage('email has invalid format'),
  ])
];

const authorization = (req, res, next) => {

  const secretKeyBase64 = Buffer.from(process.env.ACCESS_SECRETBASE64, "base64");
  const jwtCookie = req.headers.cookie
  .split(";")
  .find(c => c.trim().startsWith(process.env.ACCESS_TOKEN));
  const token = jwtCookie.split("=")[1];
  const tokenresult = jwt.verify(token, secretKeyBase64, {clockTolerance: 60});
  req.userId = tokenresult.iss;
  req.userRole = tokenresult.role;
  return next();

};

function handleValidationErrors(req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }
  return next();

};

router.post(`/user-controller/enroll`,  validation, handleValidationErrors, async (req, res) => {
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
        console.log("[API] encrollemnt error 1", response)
        res.status(400).json({error: "Api returned an error! Error is logged in console"});
      }
    } catch (error) {
      res.status(400).json({error});
      console.log("[API] enrollment error 2",  (error.response)?error.response:error);

    }
  }
  catch (error) {
    console.log(error);
    res.status(400).json({error});
  }

});

router.post(`/user-controller/delete`,  authorization, async (req, res) => {

  const bodyJson = null;
  const email = req.body.email;

  try {

    const url = `${process.env.ALMEFY_APIHOST}/v1/entity/identities`+ "/" + encodeURIComponent(email);;
    const signedToken = createSignedToken("DELETE", url, bodyJson)

    const response = await axios.delete(url, {
      headers: {
        "Authorization": `Bearer ${signedToken}`,
        "Content-Type": "application/json; charset=utf-8",
      }
    });
    if (response.status===204) {
      res.status(response.status).json({message: `Identity {email} deleted`});
    } else {
      console.log("[API] enrollment error", response)
      res.status(400).json({error: "Api returned an error! Error is logged in console"});
    }
  }
  catch (error) {
    console.log(error);
    res.status(400).json({error});
  }

});

router.post(`/admin-controller/entity/identities`, authorization, async (req, res) => {

  try {

    const bodyJson = null;
    let url = `${process.env.ALMEFY_APIHOST}/v1/entity/identities`;

    if (req.body.identity) {
      url += "/" + encodeURIComponent(req.body.email);
    }

    const signedToken = createSignedToken("GET", url, bodyJson)

    try {
      const response = await axios.get(url, {
        headers: {
          "Authorization": `Bearer ${signedToken}`,
          "Content-Type": "application/json; charset=utf-8",
        }
      })
      res.status(response.status).json(response.data); // proxy results
    } catch (error) {
      console.log("[API] There was an error",  (error.response)?error.response:error);
      res.status(500).json({"error": "[API] There was an error"});
    }
  }
  catch (error) {
    console.log("[API] There was an error",  (error.response)?error.response:error);
    res.status(500).json({"error": "[API] There was an error"});
  }

});

router.get(`/login-controller`, async (req, res) => {

  try {

    const token = req.get(process.env.CONTROLLER_AUTH_TOKEN);

    if (token) {

      const secretKeyBase64 = Buffer.from(process.env.ALMEFY_SECRETBASE64, "base64");
      const tokenresult = jwt.verify(token, secretKeyBase64, {clockTolerance: 60});

      console.log("[API] JWT Token from API", token);
      console.log("[API] JWT Challenge response verifyed - sending OTP", tokenresult);

      const sendUrl = `${tokenresult.iss}/v1/entity/identities/${encodeURIComponent(tokenresult.sub)}/authenticate`;
      const processAuthentificationData = JSON.stringify({ "challenge": tokenresult.jti, "otp": tokenresult.otp });
      const mytime = Math.floor(new Date().getTime() / 1000);
      const bearerPayload = {
        iss: process.env.ALMEFY_KEY,
        aud: process.env.ALMEFY_APIHOST,
        iat: mytime,
        nbf: mytime,
        exp: mytime+10,
        method: "POST",
        url: sendUrl,
        bodyHash: CryptoJS.SHA256(processAuthentificationData).toString()
      };
      const signedToken = jwt.sign(bearerPayload, secretKeyBase64);

      console.log("signedToken", signedToken);
      console.log("processAuthentificationData", processAuthentificationData);

      try {

        const result = await axios.post(sendUrl, processAuthentificationData, {
          headers: {
            "Authorization": `Bearer ${signedToken}`,
            "Content-Type": "application/json; charset=utf-8",
          }}
        );

        if (result.status===200) {

          const secretKeyBase64 = Buffer.from(process.env.ACCESS_SECRETBASE64, "base64");

          const admin = JSON.parse(fs.readFileSync('./api/admin.json', 'utf8'));
          console.log(admin)
          const accessPayload = {
            sub: tokenresult.sub,
            role: (admin.find(t => t.identity.toLowerCase() === tokenresult.sub.toLowerCase())? "ADMIN" : "USER")
          };

          const signOptions = {
            expiresIn: '86400000',
            algorithm: 'HS256',
          };

          const accessToken = jwt.sign(accessPayload, secretKeyBase64, signOptions);
          console.log("[API] challenge successfully completed", accessToken);
          console.log(process.env.ACCESS_TOKEN);

          res.cookie(process.env.ACCESS_TOKEN, accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
          });

          res.json({status: 200, "message" : "otp works - created access token and set as jwt cookie"});
          console.log("accessPayload", accessPayload);

        } else {

          console.log("[API] There was an error - reload challenge", result);
          res.json({status: 400, "message" : "There was an error"});

        }

      } catch (error) {

        console.log("[API] There was an error",  (error.response)?error.response:error);

      }

    }

  }
  catch (error) {
    console.log(error);
  }

});

router.get(`/login-controller/logout`, (req, res) => {
  res.clearCookie(process.env.ACCESS_TOKEN);
  res.end();
});

module.exports = {
  path: '/api',
  handler: router
}
