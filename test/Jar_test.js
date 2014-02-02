"use strict"

var Jar = require("../src/Jar.js")
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

describe("Jar", function () {
    before(function (done) {
        makeHelloJarFile(done)
    })

    it("should …", function () {
        
    })
})