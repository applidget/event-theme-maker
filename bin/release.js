#!/usr/bin/env node

const package = require("../lib/release/package");

package("grand-conference", (buildDir) => {
  console.log("ok", buildDir);
})

// first webpack build. This will set assets/dist
// then copy in the build dir what needs to be exposed
// the set proper URL in layouts AND in specs.yml
// bundle for fast syncing (zip)
// upload to S3
