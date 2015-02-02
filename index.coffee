__doc__ = """
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

"""

{ promisify } = require 'bluebird'

module.exports = promisify

proxyAll = (src, target, proxyFn) ->
  for key in Object.keys(src) # Gives back the keys on this object, not on prototypes
    do (key) ->
      return if Object::[key]? # Ignore any rewrites of toString, etc which can cause problems
      return if Object.getOwnPropertyDescriptor(src, key).get? # getter methods can have unintentional side effects when called in the wrong context
      return unless typeof src[key] is 'function' # getter methods may throw an exception in some contexts

      target[key] = proxyFn(key)

  target

proxyBuilder = ->
  (that) ->
    result =
      if typeof(that) is 'function'
        func = promisify that
        func.__proto__ = Object.getPrototypeOf(that).promise if Object.getPrototypeOf(that) isnt Function.prototype
        func
      else
        Object.create(Object.getPrototypeOf(that) and Object.getPrototypeOf(that).promise or Object::)

    result.that = that

    proxyAll that, result, (key) ->
      (args...) ->
          # Relookup the method every time to pick up reassignments of key on obj or an instance
          @that[key].promise.apply(@that, args)


defineMemoizedPerInstanceProperty = (target, propertyName, factory) ->
  cacheKey = "__fibrous#{propertyName}__"
  Object.defineProperty target, propertyName,
    enumerable: false
    set: (value) ->
      delete @[cacheKey]
      Object.defineProperty @, propertyName, value: value, writable:true, configurable: true, enumerable: true # allow overriding the property turning back to default behavior
    get: ->
      unless Object::hasOwnProperty.call(@, cacheKey) and @[cacheKey]
        Object.defineProperty @, cacheKey, value: factory(@), writable: true, configurable: true, enumerable: false # ensure the cached version is not enumerable
      @[cacheKey]

# Mixin sync and future to Object and Function
for base in [Object::, Function::]
  defineMemoizedPerInstanceProperty(base, 'promise', proxyBuilder())
