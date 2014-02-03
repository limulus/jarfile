"use strict"

var Jar = require("../src/Jar.js")
  , assert = require("assert")
  , sinon = require("sinon")

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

    it("should emit an error event if no such file exists", function (done) {
        var jar = new Jar("bogus/path.jar")
        jar.on("error", function (err) {
            assert.ok(err)
            done()
        })
    })

    describe("prototype.valueForManifestEntry", function () {
        var jar

        beforeEach(function () {
            sinon.stub(Jar, "_readJarFile").yieldsAsync(null, manifestContents)
            jar = new Jar("foo.bar")
        })

        afterEach(function () {
            Jar._readJarFile.restore()
        })

        it("should return entry values from the main section", function (done) {
            jar.on("ready", function () {
                assert.equal(jar.valueForManifestEntry("Main-Class"), "net.desert.hello.Hello")
                done()
            })
        })

        it("should return entry values from other sections", function (done) {
            jar.on("ready", function () {
                assert.equal(jar.valueForManifestEntry("foo", "Bar"), "baz")
                done()
            })
        })
    })
})

var manifestContents = "Manifest-Version: 1.0\r\nCreated-By: 1.6.0_65 (Apple Inc.)\r\nMain-Class: net.desert.hello.Hello\r\n\r\nName: foo\r\nBar: baz\r\n"
