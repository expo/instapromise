#!/usr/bin/env coffee

{ exec } = require 'child_process'
fs = require 'fs'

exec "coffee -c *.coffee", (err, result) ->
  exec """coffee -e 'console.log(require(".").__doc__);'""", (err, result) ->
    fs.writeFileSync './README.md', """
    # instapromise
    Promisify node style async functions by putting a `.promise` after them (or after the object for methods)

    #{ result }
    """
