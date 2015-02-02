promisify = require '.'
request = require 'request'

request.promise.get('http://cdc03.com/').then ([response, body]) ->
  console.log "body=", body
