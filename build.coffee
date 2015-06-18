#!/usr/bin/env coffee

{ execSync } = require 'child_process'
fs = require 'fs'

execSync "coffee -c -o build src"
doc = execSync """coffee -e 'console.log(require("./src").__doc__)'"""
fs.writeFileSync './README.md', """
  # Instapromise [![Build Status](https://travis-ci.org/exponentjs/instapromise.svg)](https://travis-ci.org/exponentjs/instapromise)
  Promisify Node-style asynchronous functions by putting a `.promise` after them (or after the object for methods).

  [![npm package](https://nodei.co/npm/instapromise.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/instapromise/)

  #{ doc }
  """
