# Sample Login via nuxt.js

## Environment
Check if node running ...  

`node -v` (Running node v16.13.1)  
`npm -v` (Running npm v8.3.0)

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3033
$ npm run dev
```
Values in .env are adjusted and should fit your requirements

You should receive some warnings (node) but for testing purposes they can be ignored.  
After `npm run dev` the site should be available at the url http://localhost:3033

Please be sure you downloaded the mobile App
via Google App Store https://play.google.com/store/apps/details?id=com.instaholding.instalog  
or Apple Store https://apps.apple.com/app/instalog-in/id1097751906  

Please enroll your identity, send the provisioning email and scan with the APP to activate your account for this Sample Login via nuxt.js.

After doing that you can identify yourself with secure Authentication in One Step. Without password! Based on IBE!
The last step is creating a JWT Token with your identity signed with a secret key in your .env (ACCESS_SECRETBASE64) file. 

In console.log you see several outputs in the Browser Debugger and starting shell and you can add your own outputs to comprehend how IBE works ... without a password!
