# instapromise
Promisify node style async functions by putting a `.promise` after them (or after the object for methods)

If you use this library then if you put `.promise` after a Node-style async
function, it will turn it into a function that returns a Promise instead of
taking a callback.

The original function is available as a property on the Promise generating
function (`.___instapromiseOriginalFunction___`).

```
  var fs = require('fs');
  var promisify = require('instapromise');
  var p = fs.readFile.promise("/tmp/hello", 'utf8');
  p.then(console.log)
```

If you want to promisify methods, use `.promise` after the object and before
the method name.

```
  var fs = require('fs');
  var promisify = require('instapromise');
  var p = fs.promise.readFile("/tmp/hello", 'utf8');
  p.then(console.log)
```

2.0.0 differs from 1.x in that 1.x provides a polyfill for environments 
without a native `Promise` implementation, but in general, most environments 
you'll use now provide `Promise` 

This code is based on the proxying code used in fibrous.
https://github.com/goodeggs/fibrous/blob/master/src/fibrous.coffee

