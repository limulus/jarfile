"use strict"

var Jar = require("../src/Jar.js")
  , assert = require("assert")
  , sinon = require("sinon")
  , path = require("path")

describe("Jar", function () {
    it("should emit an error event if no such file exists", function (done) {
        var jar = new Jar(path.join("bogus", "path.jar"))
        jar.on("error", function (err) {
            assert.ok(err)
            done()
        })
    })

    it("should emit an error event if the manifest contains an error", function (done) {
        sinon.stub(Jar, "_readJarFile").yieldsAsync(null, "~bogus manifest content~")
        var jar = new Jar("foo.jar")
        jar.on("error", function (err) {
            assert.ok(err)
            done()
        })
        Jar._readJarFile.restore()
    })

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
            // The Specification-Title entry comes from xalan: http://repo1.maven.org/maven2/xalan/serializer/2.7.1/serializer-2.7.1.jar
            assert.strictEqual(mf["main"]["Specification-Title"], "XSL Transformations (XSLT), at http://www.w3.org/TR/xslt")
            /*
                The empty "Built-By" may or may not be legit however people do it. One reason is when building JAR files in maven
                there is no way to remove default entries such as Built-By but you can blank them out.
                E.G. http://stackoverflow.com/questions/25098307/hiding-manifest-entries-with-maven
            */
            assert.strictEqual(mf["main"]["Built-By"], "")
            // The multi-line entry below is made up but theoretically possible
            assert.strictEqual(mf["main"]["CrunchyTasty-Apples"], "XSL Transformations (XSLT), at http://www.w3.org/TR/xsltTransformationsTransformationsTransformationsTransformationsffTR/xsltTransformationsTransformationsTransformationsTransformationsaa")
        })
    })

    describe("prototype.valueForManifestEntry", function () {
        var jar

        beforeEach(function (done) {
            sinon.stub(Jar, "_readJarFile").yieldsAsync(null, manifestContents)
            jar = new Jar("foo.bar")
            jar.on("ready", function () { done() })
        })

        afterEach(function () {
            Jar._readJarFile.restore()
        })

        it("should return entry values from the main section", function () {
            assert.equal(jar.valueForManifestEntry("Main-Class"), "net.desert.hello.Hello")
        })

        it("should return entry values from other sections", function () {
            assert.equal(jar.valueForManifestEntry("foo", "Bar"), "baz")
        })

        // See issue #5
        it("should return entry values from entries whose names contain digits", function () {
            assert.equal(jar.valueForManifestEntry("foo", "SHA-256-Digest"), "i68JQ1kocrRMFY73CPfLbGDIDnLKYDutWCyV2OVPs1M=")
        })

        it("should return null for non-existent entries", function () {
            assert.strictEqual(jar.valueForManifestEntry("bogus"), null)
            assert.strictEqual(jar.valueForManifestEntry("foo", "bogus"), null)
            assert.strictEqual(jar.valueForManifestEntry("bogus", "bogus"), null)
        })
    })
})

var manifestContents = [
    "Manifest-Version: 1.0",
    "Created-By: 1.6.0_65 (Apple Inc.)",
    "Main-Class: net.desert.hello.Hello",
    "Specification-Title: XSL Transformations (XSLT), at http://www.w3.org/\r\n TR/xslt",
    "CrunchyTasty-Apples: XSL Transformations (XSLT), at http://www.w3.org/\r\n TR/xsltTransformationsTransformationsTransformationsTransformationsff\r\n TR/xsltTransformationsTransformationsTransformationsTransformationsaa",
    "Built-By: ",
    "\r\nName: foo",
    "SHA-256-Digest: i68JQ1kocrRMFY73CPfLbGDIDnLKYDutWCyV2OVPs1M=",
    "Bar: baz\r\n"].join("\r\n")
