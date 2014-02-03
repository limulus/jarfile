"use strict"

var Jar = module.exports.Jar = require("./src/Jar.js")

/**
 * Cache for Jar instances.
 * @private
 */
var _cache = {}

/**
 * Creates the Jar object for the given path or fetches it from
 * the cache.
 * @param {string} jarPath
 * @param {function(Error?, Jar)} cb
 */
module.exports.fetchJarAtPath = function (jarPath, cb) {
    if (_cache[jarPath]) return cb(null, _cache[jarPath])

    var jar = new Jar(jarPath)

    jar.on("ready", function () {
        _cache[jarPath] = jar
        return cb(null, jar)
    })

    jar.on("error", function (err) {
        return cb(err)
    })
}
