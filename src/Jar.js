"use strict"

var archive = require("ls-archive")
  , inherits = require("util").inherits
  , EventEmitter = require("events").EventEmitter
  , path = require("path")

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

    Jar._readJarFile(jarPath, path.normalize("META-INF/MANIFEST.MF"), function (err, manifestData) {
        if (err) return this.emit("error", err)

        try {
            this._manifest = Jar._parseManifest(manifestData)
        }
        catch (e) {
            this.emit("error", e)
        }

        this.emit("ready", this)
    }.bind(this))
}
inherits(Jar, EventEmitter)

/**
 * Returns the value for the given entry in the manifest. If two arguments
 * are specified, the first is considered to be the section name.
 * @param {string} sectionNameOrEntryName
 * @param {string=} entryName
 * @return {string?}
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
        return this._manifest["main"][entryName] || null
    }
    else {
        if (! this._manifest["sections"][sectionName]) return null
        return this._manifest["sections"][sectionName][entryName] || null
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
      , skip = 0
      , currentSection = null

    manifest = manifest.toString("utf8")
    var lines = manifest.split(/(?:\r\n|\r|\n)/);
    lines.forEach(function (line, i) {
        var entry;
        // this line may have already been processed, if so skip it
        if (skip) {
            skip--
            return
        }

        // Watch for blank lines, they mean we're starting a new section
        if (line === "") {
            expectingSectionStart = true
            return
        }

        // Extract the name and value from entry line
        var pair = line.match(/^([a-z0-9_-]+): (.*)$/i)
        if (!pair) {
            _throwManifestParseError("expected a valid entry", i, line)
        }
        var name = pair[1], val = (pair[2] || "")

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
            entry = result["sections"][currentSection]
        }
        else {
            entry = result["main"]
        }
        entry[name] = val
        for (var j = i + 1; j < lines.length; j++) {
            var byteLen = Buffer.byteLength(line, "utf8")
            if (byteLen >= 70) {
                line = lines[j]
                if (line && line[0] === " ") {
                    // continuation lines must start with a space
                    entry[name] += line.substr(1)
                    skip++
                    continue
                }
            }
            break
        }
    })

    return result
}


var _throwManifestParseError = function (message, lineNumber, lineValue) {
    throw new Error("Error parsing manifest file, " + message + ", on line " + lineNumber + ": " + lineValue)
}
