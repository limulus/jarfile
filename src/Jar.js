"use strict"

var archive = require("ls-archive")
  , inherits = require("util").inherits
  , EventEmitter = require("events").EventEmitter

/**
 * Information about a jar file.
 * @constructor
 * @param {string} jarPath
 */
var Jar = module.exports = function (jarPath) {
    EventEmitter.call(this)

    /**
     * @private
     * @type {string}
     */
    this._jarPath = jarPath

    /**
     * @private
     * @type {Object.<string,string>}
     */
    this._manifest = null

    Jar._readJarFile(jarPath, "META-INF/MANIFEST.MF", function (err, manifestData) {
        if (err) return this.emit("error", err)
        this._manifest = Jar._parseManifest(manifestData)
        this.emit("ready", this)
    }.bind(this))
}
inherits(Jar, EventEmitter)

/**
 * Returns the value for the given entry in the manifest. If two arguments
 * are specified, the first is considered to be the section name.
 * @param {string} sectionNameOrEntryName
 * @param {string=} entryName
 * @return {string}
 */
Jar.prototype.valueForManifestEntry = function (sectionNameOrEntryName, entryName) {
    var sectionName = null

    if (arguments.length >= 2) {
        sectionName = sectionNameOrEntryName
    }
    else {
        entryName = sectionNameOrEntryName
    }

    if (sectionName === null) {
        // No section name specified, so use the main section.
        return this._manifest["main"][entryName]
    }
    else {
        return this._manifest["sections"][sectionName][entryName]
    }
}

/**
 * Dependency injection point for ls-archive readFile function.
 * @private
 * @param {string} jarPath
 * @param {string} archivedFilePath
 * @param {function(Error?, string)} cb
 */
Jar._readJarFile = function (jarPath, archivedFilePath, cb) {
    archive.readFile(jarPath, archivedFilePath, cb)
}

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
