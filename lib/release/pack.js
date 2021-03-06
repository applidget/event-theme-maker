const fs = require("fs");
const fse = require("fs-extra");
const { exec } = require("child_process");

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
  const path = `./${buildDir}/${theme}`;
  fs.rmSync(path, { recursive: true, force: true });
  fs.mkdirSync(path, { recursive: true });
  return path;
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
    "assets/dist": assetsDir,
    "config": "config",
    "sections": "sections",
    "snippets": "snippets",
    "templates": "templates",
    "specs.yml": "specs.yml",
    "layouts": "layouts"
  };

  const themePath = `./themes/${theme}`;

  Object.entries(mapping).forEach(([src, dst]) => {
    const fullSrc = `${themePath}/${src}`;
    if (fs.existsSync(fullSrc)) {
      fse.copySync(fullSrc, `${releaseDir}/${dst}`);
    }
  });
}

const replaceInFile = (path, reg, content) => {
  if (!fs.existsSync(path)) {
    return;
  }

  const data = fs.readFileSync(path, "utf8");
  const newData = data.replace(reg, content);
  fs.writeFileSync(path, newData, "utf8");
}

const writeAssetsProductionURL = (theme, buildDir, releaseDir, assetsDir) => {
  const url = `${PRODUCTION_ENDPOINT}/${buildDir}/${theme}/${assetsDir}`;
  const reg = new RegExp(DEV_SERVER_ENDPOINT, "g");

  ["theme", "embed"].forEach(layout => {
    replaceInFile(`${releaseDir}/layouts/${layout}.liquid`, reg, url);
  });
}

const writeSpecsProductionURL = (buildDir, releaseDir) => {
  const host = `${PRODUCTION_ENDPOINT}/${buildDir}`;
  const reg = new RegExp(`https://${SPECS_FAKE_HOST}`, "g");

  replaceInFile(`${releaseDir}/specs.yml`, reg, host);
}

