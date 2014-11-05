var duplexer = require('duplexify');
var hmac = require('hmac-stream');
var ciphers = require('create-cipher');
var sbs = require('sbs');

exports.cipher = cipher;
function cipher(password) {
  var start = new sbs(2 * 1024);
  var end = new hmac.Authenticate(password, {
        min: 1,
        max: 6 * 1024
      });
  var mid = new ciphers.Cipher('aes-128-ctr', password);
  var tail = new sbs(2 * 1024);
  
  var out =  duplexer(start, tail);
  function onErr(e) {
    out.emit('error', e);
  }
  start.on('error', onErr);
  mid.on('error', onErr);
  end.on('error', onErr);
  tail.on('error', onErr);
  start.pipe(mid).pipe(end).pipe(tail);
  return out;

}
exports.decipher = decipher;
function decipher(password) {
  
  var start = new hmac.Verify(password);
  var end = ciphers.Decipher('aes-128-ctr', password);
  var out = duplexer(start, end);
  function onErr(e) {
    out.emit('error', e);
  }
  start.on('error', onErr);
  end.on('error', onErr);
  start.pipe(end);
  return out;
}