const fs = require("fs");
const fse = require("fs-extra");
const { exec } = require("child_process");

const {
  PRODUCTION_ENDPOINT,
  DEV_ASSETS_ENDPOINT,
  SPECS_FAKE_HOST
} = require("./constants");

module.exports = (theme, cb) => {
  gitRev(rev => {
    const releaseDir = createReleaseDir(theme);
    const assetsDir = `assets-${rev}`;
    copyFiles(theme, releaseDir, assetsDir);
    writeAssetsProductionURL(theme, releaseDir, assetsDir);
    writeSpecsProductionURL(releaseDir);
    cb(releaseDir, assetsDir);
  });
}

const createReleaseDir = (theme) => {
  const path = `./builds/${theme}`;
  fs.rmSync(path, { recursive: true, force: true });
  fs.mkdirSync(path, { recursive: true });
  return path;
}

const gitRev = (cb) => {
  const cmd = "git rev-parse --short HEAD";
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      // todo log fatal
      return;
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
    fse.copySync(`${themePath}/${src}`, `${releaseDir}/${dst}`);
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

const writeAssetsProductionURL = (theme, releaseDir, assetsDir) => {
  const url = `${PRODUCTION_ENDPOINT}/builds/${theme}/${assetsDir}`;
  const reg = new RegExp(DEV_ASSETS_ENDPOINT, "g");

  ["theme", "embed"].forEach(layout => {
    replaceInFile(`${releaseDir}/layouts/${layout}.liquid`, reg, url);
  });
}

const writeSpecsProductionURL = (releaseDir) => {
  const host = `${PRODUCTION_ENDPOINT}/builds`;
  const reg = new RegExp(`https://${SPECS_FAKE_HOST}`, "g");

  replaceInFile(`${releaseDir}/specs.yml`, reg, host);
}

