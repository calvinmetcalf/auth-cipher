var fs = require('fs');
var AuthEnc = require('./');
var crypto = require('crypto');
var Readable = require('stream').Readable;
var through = require('through2');
var test = require('tape');
test('works', function (t) {
  t.plan(1);
  
  var pass = new Buffer('pass');
  var cipher = AuthEnc.cipher(pass);
  var decipher = AuthEnc.decipher(pass);
  var rand = new Random(1024 * 1024 * 40);
  var h1 = crypto.createHash('sha512');
  var h2 = crypto.createHash('sha512');
  var d1, d2;
  rand.pipe(through(function (chunk, _, next) {
    h1.update(chunk);
    next();
  }, function (next) {
    d1 = h1.digest('hex');
    next();
  }));

  rand.pipe(cipher).pipe(decipher).pipe(through(function (chunk, _, next) {
    h2.update(chunk);
    next();
  }, function (next) {
    d2 = h2.digest('hex');
    t.equals(d1, d2);
    next();
  }));
});
test('to file', function (t) {
  t.test('set up', function (t) {
    fs.unlink('./fixture', function () {
      t.end();
    });
  });
  t.test('works 2', function (t) {
    t.plan(1);
    var pass = new Buffer('password');
    var cipher = AuthEnc.cipher(pass);
    var decipher = AuthEnc.decipher(pass);
    var h1 = crypto.createHash('sha512');
    var h2 = crypto.createHash('sha512');
    var d1, d2;
    var rand = new Random(1024 * 1024 * 40);
    rand.pipe(through(function (chunk, _, next) {
      h1.update(chunk);
      next();
    }, function (next) {
      d1 = h1.digest('hex');
      next();
    }));
    rand.pipe(cipher).pipe(fs.createWriteStream('./fixture')).on('finish', function () {
      fs.createReadStream('./fixture').pipe(decipher).pipe(through(function (chunk, _, next) {
        h2.update(chunk);
        next();
      }, function (next) {
        var d2 = h2.digest('hex');
        t.equals(d1, d2);
        next();
      }));
    });
  });
  t.test('clean up', function (t) {
    fs.unlink('./fixture', function () {
      t.end();
    });
  });
});
function hash(input) {
    return crypto.createHash('sha512').update(input).digest();
  }
  require('util').inherits(Random, Readable);
  function Random(max){
    Readable.call(this);
    this._cache = crypto.randomBytes(64);
    this._total = this._cache.length;
    this._max = max || Infinity;
  }

  Random.prototype._read = function (size) {
    var out = this._cache;
    while (out.length <= size) {
      this._cache = hash(this._cache);
      out = Buffer.concat([out, this._cache]);
      this._total += this._cache.length;
      if (this._total > this._max) {
        this.push(out);
        this.push(null);
        return;
      }
    }
    out = out.slice(0, size);
    var self = this;
    setImmediate(function () {
      self.push(out);
    });
  };