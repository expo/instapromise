__doc__ = """


Based on the `thenify` code here:
https://github.com/thenables/thenify/blob/master/index.js

"""


Promise ?= require 'native-or-bluebird'

thenify = ($$___thenifyFunction___$$) ->
  """Turns a Node-style async function into a Promise"""

  if typeof($$___thenifyFunction___$$) is 'function'
    eval createWrapper $$___thenifyFunction___$$.name
  else
    throw new Error "Can't thenify a non-function"

createCallback = (resolve, reject) ->
  (err, result) ->
    if err?
      reject err
    else
      resolve result

createWrapper = (name) ->
  """
  (function #{ name ? '' }() {
    var self = this;
    var len = arguments.length;
    var args = new Array(len + 1);
    for (var i = 0; i < len; ++i) {
      args[i] = arguments[i];
    }
    var lastIndex = i;
    return new Promise(function (resolve, reject) {
      args[lastIndex] = createCallback(resolve, reject);
      $$___thenifyFunction___$$.apply(self, args);
    });
  });
  """

module.exports = thenify
