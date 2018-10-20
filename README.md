jarfile   [![Build Status](https://travis-ci.org/limulus/jarfile.svg?branch=master)](https://travis-ci.org/limulus/jarfile)
=======

A Node.js module for getting information about a jar file.


Synopsis
--------

Want to know something about what is going on in a jar file? This module may help!


Caveats
-------

Currently this module can only tell you about manifest entries. If there's other stuff worth knowing about the contents of a jar file, feel free to submit a pull request!


Installation
------------

```shell
npm install jarfile
```

Example
-------

```javascript
var jarfile = require("jarfile")

// Get the Main-Class entry from foo.jar.
jarfile.fetchJarAtPath("foo.jar", function (err, jar) {
    console.log(jar.valueForManifestEntry("Main-Class"))
})
```

Functions
---------

### jarfile.fetchJarAtPath(path, callback)

Reads information from the jar file at the given path, and passes the following to the callback:

  * An error if there was an error reading the jar file or its manifest.
  * A `Jar` object. See the methods below for what to do with this object.

Note that this function caches `Jar` objects and doesn’t make any attempts to ensure the underlying file has not changed.


### Jar.prototype.valueForManifestEntry([sectionName], entryName)

Returns the string value for the given entry’s name. If you’re looking for an entry in a particular section, specify the section’s name as the first argument. If the section or entry does not exist in the manifest, `null` is returned.
