# Almefy Sample Login via nuxt.js

## Environment

Please take a look at the sample.env File, rename and change ACCESS_KEY, ACCESS_SECRETBASE64, ALMEFY_KEY and ALMEFY_SECRETBASE64 to your belongings.

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3033
$ npm run dev
```
Please adjust all values in .env.

Create local Key and Secret with 
$ node createSecret.js

http://localhost:3033/login

You should get a qrcoding, directly challengeing against your API.

If you use the Mobile Test App the frontend-JS challenge send the result to backend API - you'll see the result in bash console the controller output

roundtrip works completly, jwt is created and stored as cookie (more to come e.g. refresh-token)
