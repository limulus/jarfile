"use strict"

var Jar = require("../src/Jar.js")
  , assert = require("assert")

describe("Jar", function () {
    describe("_parseManifest", function () {
        it("should throw an error when it hits an invalid line", function () {
            assert.throws(function () {
                Jar._parseManifest("bogus")
            })
        })

        it("should throw an error when it hits an invalid section start", function () {
            assert.throws(function () {
                Jar._parseManifest("Manifest-Version: 1.0\n\nInvalid-Section-Start: foo\nBar: baz")
            })
        })

        it("should return an object with the manifest's key-values", function () {
            var mf = Jar._parseManifest(manifestContents)
            assert.strictEqual(mf["main"]["Manifest-Version"], "1.0")
            assert.strictEqual(mf["sections"]["foo"]["Bar"], "baz")
        })
    })
})

var manifestContents = "Manifest-Version: 1.0\r\nCreated-By: 1.6.0_65 (Apple Inc.)\r\nMain-Class: net.desert.hello.Hello\r\n\r\nName: foo\r\nBar: baz\r\n"
