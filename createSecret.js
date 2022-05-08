const crypto = require('crypto');

const key = crypto.randomBytes(20).toString('hex'); // random key
const secret = crypto.createHmac('sha256', key).digest('base64'); // secret from random key

console.log("key", key);
console.log("secret", secret);
