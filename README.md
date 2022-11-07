# Sample Login via nuxt.js

## Environment
Check if node running ...  

`node -v` (Running node v16.13.1)  
`npm -v` (Running npm v8.3.0)

## Build Setup
```bash
# install dependencies
$ npm install
```
Please copy .env.sample to .env and adjust your values. Please be sure to enter your given 
``` 
ALMEFY_KEY= and ALMEFY_SECRETBASE64=
```

MaybeYou should receive some warnings (node) but for testing purposes they can be ignored.  
After `npm run dev` the site should be available at the url http://localhost:3033

Please be sure you downloaded the mobile App
via Google App Store https://play.google.com/store/apps/details?id=com.instaholding.instalog  
or Apple Store https://apps.apple.com/app/instalog-in/id1097751906


## Serve web at localhost:3033
``` 
$ npm run dev

Please be sure to set PUBLIC_ENROLLMENT=true in your .env 
``` 

Please enroll your identity, send the provisioning email and scan with the APP to activate your account for this Sample Login via nuxt.js.

After doing that you can identify yourself with secure Authentication in One Step. Without password! Based on IBE! A local JWT Token is created and set as httponly cookie to identify yourself in every roundtrip.

Now you can disable
```
PUBLIC_ENROLLMENT=false
```

If you enter yourself in /api/admin.json
```
[
  {"identity": "your@email.adress"}
]
```

you are automatically detected as Admin of this page and got an extra menuitem where you are enable to enroll more users and resend enrollments or delete them.

# Adjust the local JWT-Key

The last but not needed step is creating a unique JWT Token with your identity signed with a secret key in your .env (ACCESS_SECRETBASE64) file. Please use 
```
node createSecret.js
```
to get your own random key and secret. Currently only the secret is needed for hsm256 symmetric enrcyption of the JWT-token.


# Summary 

There a several console in the browser-debugger and starting shell and you can add your own outputs to comprehend how IBE works ... without a password!

Planned improvments the next weeks

- move to public git
- enable per identity view of tokens enrolled
- set admin-role via web-interface
- enable enrollment without email locally on screen
- 
