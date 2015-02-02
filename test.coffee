promisify = require '.'



class SomeClass
  constructor: (@x) ->
    console.log "Made a SomeClass instance with x=#{ @x }"

  nodeStyleAsyncMethod: (y, callback) ->
    console.log "Adding #{ @x } and #{ y }"
    callback null, @x + y

module.exports = {
  SomeClass
}

if require.main is module
  sc = new SomeClass 3
  sc.promise.nodeStyleAsyncMethod(5).then(console.log)
  sc.promiseArray.nodeStyleAsyncMethod(5).then(console.log)
  request = require 'request'
  request.promise.get('http://cdc03.com/').then (response, body) ->
    console.log "body1=", body, "or=", response.body
  request.promiseArray.get("http://cdc03.com/").then ([response, body]) ->
    console.log "body2=", body
