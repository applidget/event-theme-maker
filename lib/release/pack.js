const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");
const { exec } = require("child_process");
const crypto = require("crypto");
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
    const layoutPath = path.join(releaseDir, "layouts", `${layout}.liquid`);
    replaceInFile(layoutPath, reg, url);

    writeSRIforMainStylesheets(releaseDir, assetsDir, layoutPath, url);
    writeSRIforMainJavascript(releaseDir, assetsDir, layoutPath, url);

  });
}

const writeSpecsProductionURL = (buildDir, releaseDir) => {
  const host = `${PRODUCTION_ENDPOINT}/${buildDir}`;
  const reg = new RegExp(`https://${SPECS_FAKE_HOST}`, "g");

  replaceInFile(path.join(releaseDir, "specs.yml"), reg, host);
}

const computeSriHash = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  const hash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("base64");
  return `sha256-${hash}`;
}

const writeSRIforMainStylesheets = (releaseDir, assetsDir, layoutPath, url) => {
  const cssHash = computeSriHash(path.join(releaseDir, assetsDir, "main.css"));
  replaceInFile(
    layoutPath,
    new RegExp(`href="${url}/main\\.css"`, "g"),
    `href="${url}/main.css" integrity="${cssHash}" crossorigin="anonymous"`
  );
}

const writeSRIforMainJavascript = (releaseDir, assetsDir, layoutPath, url) => {
  const jsHash = computeSriHash(path.join(releaseDir, assetsDir, "main.js"));
  replaceInFile(
    layoutPath,
    new RegExp(`src="${url}/main\\.js"`, "g"),
    `src="${url}/main.js" integrity="${jsHash}" crossorigin="anonymous"`
  );
}