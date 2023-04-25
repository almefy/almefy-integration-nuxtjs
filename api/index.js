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

  try {

    const secretKeyBase64 = Buffer.from(process.env.ACCESS_SECRETBASE64, "base64");
    const jwtCookie = req.headers.cookie
    .split(";")
    .find(c => c.trim().startsWith(process.env.ACCESS_TOKEN));
    const token = jwtCookie.split("=")[1];
    const tokenresult = jwt.verify(token, secretKeyBase64, {clockTolerance: 60});

    // FIXME - next round ... static bucket arraylist with sessions where the update is stored
    // const currentDatetime = new Date();
    // const sessionExpire = new Date(tokenresult.session.expiresAt);

    // console.log(currentDatetime, sessionExpire, sessionExpire - currentDatetime, sessionExpire > currentDatetime)

    req.userId = tokenresult.iss;
    req.userRole = tokenresult.role;
    req.session = tokenresult.session;

    return next();
  } catch (error) {
    console.log(error);
    res.redirect('/?no-token-found');
  }

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
    const sendEnrollment = req.body.sendEnrollment;

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
        },
        validateStatus (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      });

      if (response.status===200 || response.status===201) {
        if (sendEnrollment)
          res.status(200).json({message: `Please check your mailbox ${email} and use the Almefy-APP testing 2-Factor Authentication (2FA) in One Step. Without password!`});
        else {
          // console.log(response.data);
          res.status(200).json({"base64ImageData": response.data.base64ImageData});
        }
      } else {
        res.status(response.status).json(response.data);
        console.log("[API] unexpected return ", response);
      }

    } catch (error) {
      res.status(400).json({error});
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);

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

    const url = `${process.env.ALMEFY_APIHOST}/v1/entity/identities`+ "/" + encodeURIComponent(email);
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

router.post(`/user-controller/deleteToken`,  authorization, async (req, res) => {

  const bodyJson = null;
  const id = req.body.id;

  try {

    const url = `${process.env.ALMEFY_APIHOST}/v1/entity/tokens`+ "/" + id;
    const signedToken = createSignedToken("DELETE", url, bodyJson)

    const response = await axios.delete(url, {
      headers: {
        "Authorization": `Bearer ${signedToken}`,
        "Content-Type": "application/json; charset=utf-8",
      }
    });
    if (response.status===204) {
      res.status(response.status).json({message: `Token deleted`});
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

    if (req.body.email) {
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
      // console.log(response.data);
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
    // console.log("token", token);

    if (token) {

      try {

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

        const result = await axios.post(sendUrl, processAuthentificationData, {
          headers: {
            "Authorization": `Bearer ${signedToken}`,
            "Content-Type": "application/json; charset=utf-8",
          }}
        );

        if (result.status===200) {

          console.log(result.data)

          const secretKeyBase64 = Buffer.from(process.env.ACCESS_SECRETBASE64, "base64");
          // const admin = JSON.parse(fs.readFileSync('./api/admin.json', 'utf8'));
          const accessPayload = {
            sub: tokenresult.sub,
            role: tokenresult.role,
            session: result.data.session
          };
          const signOptions = {
            expiresIn: '86400000',
            algorithm: 'HS256',
          };

          const accessToken = jwt.sign(accessPayload, secretKeyBase64, signOptions);
          console.log("[API] challenge successfully completed", accessToken);
          // console.log(process.env.ACCESS_TOKEN);

          res.cookie(process.env.ACCESS_TOKEN, accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
          });

          res.redirect('/');

          // res.json({status: 200, "message" : "otp works - created access token and set as jwt cookie"});
          // console.log("accessPayload", accessPayload);

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

router.get(`/login-controller/logout`, authorization, async (req, res) => {

  const secretKeyBase64 = Buffer.from(process.env.ALMEFY_SECRETBASE64, "base64");
  const sendUrl = `${process.env.ALMEFY_APIHOST}/v1/entity/sessions/${req.session.id}`;
  const processAuthentificationData = null;
  const mytime = Math.floor(new Date().getTime() / 1000);
  const bearerPayload = {
    "iss": process.env.ALMEFY_KEY,
    "aud": process.env.ALMEFY_APIHOST,
    "iat": mytime,
    "nbf": mytime,
    "exp": mytime+10,
    "method": "DELETE",
    "url": sendUrl,
    "bodyHash": CryptoJS.SHA256(processAuthentificationData).toString()
  };

  const options = {
    baseURL: process.env.ALMEFY_APIHOST,
    method: 'DELETE',
    url: sendUrl,
    data: processAuthentificationData,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    }
  }

  const signedToken = jwt.sign(bearerPayload, secretKeyBase64);
  console.log(sendUrl, options, signedToken);
  options.headers.Authorization = `Bearer ${signedToken}`;

  const response = await axios.request(options);
  console.log(response)

  res.clearCookie(process.env.ACCESS_TOKEN);
  res.end();

});

module.exports = {
  path: '/api',
  handler: router
}
