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


/**
 * @private
 * @param {string} manifest
 * @reutrn {Object.<string,string>}
 */
Jar._parseManifest = function (manifest) {
    var result = {"main": {}, "sections": {}}

    var expectingSectionStart = false
      , currentSection = null

    manifest.split(/(?:\r\n|\r|\n)/).forEach(function (line, i) {
        // Watch for blank lines, they mean we're starting a new section
        if (line === "") {
            expectingSectionStart = true
            return
        }

        // Extract the name and value from entry line
        var pair = line.match(/^([a-z_-]+): (.+)$/i)
        if (!pair) {
            _throwManifestParseError("expected a valid entry", i, line)
        }
        var name = pair[1], val = pair[2]

        // Handle section start
        if (expectingSectionStart && name !== "Name") {
            _throwManifestParseError("expected section name", i, line)
        }
        else if (expectingSectionStart) {
            currentSection = val
            expectingSectionStart = false
            return
        }

        // Add entry to the appropriate section
        if (currentSection) {
            if (!result["sections"][currentSection]) {
                result["sections"][currentSection] = {}
            }
            result["sections"][currentSection][name] = val
        }
        else {
            result["main"][name] = val
        }
    })

    return result
}


var _throwManifestParseError = function (message, lineNumber, lineValue) {
    throw new Error("Error parsing manifest file, " + message + ", on line " + lineNumber + ": " + lineValue)
}
