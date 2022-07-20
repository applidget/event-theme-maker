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
const yaml = require("js-yaml");

const {
  logFatal
} = require("../utils/log");

const {
  SPECS_FAKE_HOST
} = require("../constants");

module.exports = (theme, buildDir, releaseDir, assetsDir, cb) => {
  const specsPath = `./themes/${theme}/specs.yml`;
  const files = themeFiles(specsPath);
  const bundleDir = createBundleDir(releaseDir);

  copyFilesToBundleFolder(theme, buildDir, files, bundleDir);
  archiveBundle(releaseDir, bundleDir, assetsDir, cb);
}

// convert URL contained in specs files to locale path on the file system
const urlToPath = (url) => {
  return url.replace(`https://${SPECS_FAKE_HOST}`, "./themes");
}

const elementsPaths = (specs, key) => {
  return specs[key].map(e => urlToPath(e.body_url));
}

const themeFiles = (specsPath) => {
  const specs = yaml.load(fs.readFileSync(specsPath, "utf8"));

  let files = [];

  ["sections", "layouts", "page_templates", "snippets"].forEach(key => {
    files = files.concat(elementsPaths(specs, key));
  });

  files.push(urlToPath(specs.config.main_settings));
  files.push(urlToPath(specs.config.presets.default.fr));
  files.push(urlToPath(specs.config.presets.default.en));
  files.push(urlToPath(specs.config.translations));
  files.push(urlToPath(specs.config.sections_groups));

  files.push(specsPath);

  return files;
}

const createBundleDir = (releaseDir) => {
  const path = `${releaseDir}/bundle`;
  fs.mkdirSync(path);
  return path;
}

const copyFilesToBundleFolder = (theme, buildDir, files, bundleDir) => {
  files.forEach(file => {
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

    fse.copySync(src, `${bundleDir}/${dest}`);
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
