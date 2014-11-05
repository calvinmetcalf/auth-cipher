auth-cipher
====

A streaming authenticated cipher with sensible defaults.

```
npm install auth-cipher
```

API
===

```js
var authCipher = require('auth-cipher');
var cipherStream = authCipher.cipher(new Buffer('password'));
var decipherStream = authCipher.decipher(new Buffer('password'));
something.pipe(cipherStream).pipe(something).pipe(decipherStream).pipe(somewhere);
```

An encrypt then hmac stratagy is used.

Encryption is provided by [create-cipher](https://github.com/calvinmetcalf/create-cipher) which is just a thin wrapper around node createCipher but using pbkdf2 to derive the key and IV. A 16 byte salt with 1000 iterations are used to derive the key and IV, aes-256-ctr is used for the cipher suite.

Authentication is provided by [hmac-stream](https://github.com/calvinmetcalf/hmac-stream) which divides the message into chunks and hmacs them using a key also derived from the password pbkdf2 but with a different salt.  The size of a chunk is variable up to a certain size and is designed to be secure first with secondary goal of a trade off between avoiding too much overhead (lots of 256 bit hmacs with data chunks that are shorter then their hash) and avoiding buffering, [Sync Buffer Stream](https://github.com/calvinmetcalf/SBS) is used for this. The HMAC key is incremented after each chunk and extra data is put into the last chunk to differentiate it.