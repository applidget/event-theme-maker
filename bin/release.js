#!/usr/bin/env node

const pack = require("../lib/release/pack");
const bundle = require("../lib/release/bundle");

pack("grand-conference", (releaseDir, assetsDir) => {
  console.log("ok", releaseDir, assetsDir);
  bundle("grand-conference", releaseDir, assetsDir, () => {
    console.log("release completed");
  });
});


// first webpack build. This will set assets/dist
// then copy in the build dir what needs to be exposed
// the set proper URL in layouts AND in specs.yml
// bundle for fast syncing (zip)
// upload to S3
