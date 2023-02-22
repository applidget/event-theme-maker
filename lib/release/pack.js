const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const { exec } = require("child_process");
const replaceInFile = require("../utils/replace_in_file");

const {
  logFatal
} = require("../utils/log");

const {
  PRODUCTION_ENDPOINT,
  DEV_SERVER_ENDPOINT,
  SPECS_FAKE_HOST
} = require("../constants");

module.exports = (theme, buildDir, cb) => {
  gitRev(rev => {
    const releaseDir = createReleaseDir(theme, buildDir);
    const assetsDir = `assets-${rev}`;
    copyFiles(theme, releaseDir, assetsDir);
    writeAssetsProductionURL(theme, buildDir, releaseDir, assetsDir);
    writeSpecsProductionURL(buildDir, releaseDir);
    cb(releaseDir, assetsDir);
  });
}

const createReleaseDir = (theme, buildDir) => {
  const fullPath = path.join(".", buildDir, theme);
  fs.rmSync(fullPath, { recursive: true, force: true });
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

const gitRev = (cb) => {
  const cmd = "git rev-parse --short HEAD";
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      logFatal(`error getting git revision: ${error}, ${stderr}`);
    }

    cb(stdout.trim());
  });
}

const copyFiles = (theme, releaseDir, assetsDir) => {
  const mapping = {
    [path.join("assets", "dist")]: assetsDir, // making assets/dist assets\dist on windows
    "config": "config",
    "sections": "sections",
    "snippets": "snippets",
    "templates": "templates",
    "specs.yml": "specs.yml",
    "layouts": "layouts"
  };

  const themePath = path.join(".", "themes", theme);

  Object.entries(mapping).forEach(([src, dst]) => {
    const fullSrc = path.join(themePath, src);
    if (fs.existsSync(fullSrc)) {
      fse.copySync(fullSrc, path.join(releaseDir, dst));
    }
  });
}

const writeAssetsProductionURL = (theme, buildDir, releaseDir, assetsDir) => {
  const url = `${PRODUCTION_ENDPOINT}/${buildDir}/${theme}/${assetsDir}`;
  const reg = new RegExp(DEV_SERVER_ENDPOINT, "g");

  ["theme", "embed"].forEach(layout => {
    replaceInFile(path.join(releaseDir, "layouts", `${layout}.liquid`), reg, url);
  });

  ["magic_link_signin", "visit_route"].forEach(layout => {
    replaceInFile(path.join(releaseDir, "templates", `${layout}.liquid`), reg, url);
  });
}

const writeSpecsProductionURL = (buildDir, releaseDir) => {
  const host = `${PRODUCTION_ENDPOINT}/${buildDir}`;
  const reg = new RegExp(`https://${SPECS_FAKE_HOST}`, "g");

  replaceInFile(path.join(releaseDir, "specs.yml"), reg, host);
}

