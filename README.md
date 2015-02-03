# instapromise
Promisify node style async functions by putting a `.promise` after them (or after the object for methods)

If you use this library then if you put `.promise` after a Node-style async
function, it will turn it into a function that returns a Promise instead of
taking a callback.

Ex.
  promisify = require 'instapromise'
  p = fs.readFile.promise "/tmp/hello", 'utf8'
  p.then(console.log)

If you want to promisify methods, use `.promise` after the object and before
the method name.

Ex.
  promisify = require 'instapromise'
  p = fs.promise.readFile "/tmp/hello", 'utf8'
  p.then(console.log)

This code is based on the proxying code used in fibrous.
https://github.com/goodeggs/fibrous/blob/master/src/fibrous.coffee

