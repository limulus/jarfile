"use strict"

var archive = require("ls-archive")
  , inherits = require("util").inherits
  , EventEmitter = require("events").EventEmitter

/**
 * A jar file. 
 * @constructor
 * @param {string} jarPath
 */
var Jar = module.exports = function (jarPath) {
    EventEmitter.call(this)
    setImmediate(function () {this.emit("ready")}.bind(this))
}
inherits(Jar, EventEmitter)

