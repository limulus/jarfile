"use strict"

var jarfile = require("../index.js")
  , spawn = require("child_process").spawn
  , path = require("path")
  , fs = require("fs")
  , assert = require("assert")

var helloBuildDir = path.resolve(__dirname + "/../support/hello")
  , helloJarPath = path.resolve(__dirname + "/../support/hello/hello.jar")

var makeHelloJarFile = function (cb) {
    spawn("make", ["-C", helloBuildDir])
        .on("error", function (err) { throw err })
        .on("exit", function (code) {
            assert.equal(code, 0)
            assert(fs.existsSync(helloJarPath))
            cb()
        })
}

before(function (done) {
    makeHelloJarFile(done)
})

describe("jarfile", function () {
    describe("fetchJarAtPath", function () {
        it("should return a cached jar on repeated calls", function (done) {
            jarfile.fetchJarAtPath(helloJarPath, function (err, helloJar1) {
                assert.ifError(err)
                jarfile.fetchJarAtPath(helloJarPath, function (err, helloJar2) {
                    assert.ifError(err)
                    assert.strictEqual(helloJar1, helloJar2)
                    done()
                })
            })
        })
    })
    
    describe("Jar.prototype.valueForManifestEntry", function () {
        it("should be able to read an entry from the jar file's manifest file", function (done) {
            jarfile.fetchJarAtPath(helloJarPath, function (err, helloJar) {
                assert.equal(helloJar.valueForManifestEntry("Main-Class"), "net.desert.hello.Hello")
                done()
            })
        })
    })
})
