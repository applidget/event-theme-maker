/*
Bundle an entire theme in a tar.gz archive.

Because themes may depends on other themes, the bundle mimics a repository structure, for example, if a theme has some dependencies on the standard theme, the bundle will have a structure that looks like:

bundle/
  themes/
    my-theme/         <- the theme we are bundling
      sections/
      snippets/
      specs.yml
    standard/         <- all other themes that need to be in the bundle
      sections/
      config/

This structure is optimal, only the files required (i.e: defined in the specs.yml) are bundled.
*/

const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const iterateThemeFiles = require("../utils/iterate_theme_files");

const {
  logFatal
} = require("../utils/log");

module.exports = (theme, buildDir, releaseDir, assetsDir, cb) => {
  const bundleDir = createBundleDir(releaseDir);

  copyFilesToBundleFolder(theme, buildDir, bundleDir);
  archiveBundle(releaseDir, bundleDir, assetsDir, cb);
}

const createBundleDir = (releaseDir) => {
  const fullPath = path.join(releaseDir, "bundle");
  fs.mkdirSync(fullPath);
  return fullPath;
}

const copyFilesToBundleFolder = (theme, buildDir, bundleDir) => {
  iterateThemeFiles(theme, file => {
    const comps = file.split(path.sep);
    // removing ./
    comps.splice(0, 1);
    const dest = comps.join(path.sep);
    let src = file

    const fromTheme = comps[1];
    if (theme === fromTheme) {
      // using file from the release directory
      comps[0] = buildDir;
      src = comps.join(path.sep);
    }

    fse.copySync(src, path.join(bundleDir, dest));
  });
}

const archiveBundle = (releaseDir, bundleDir, assetsDir, cb) => {
  const cmd = `tar --exclude="./${assetsDir}" -czvf bundle.tar.gz bundle`;

  exec(cmd, { cwd: releaseDir }, (error) => {
    if (error) {
      logFatal(`error building bundle tar.gz file ${error}`);
    }

    fs.rmSync(bundleDir, { recursive: true, force: true });
    cb();
  });
}
