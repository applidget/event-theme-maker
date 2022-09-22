const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { version} = require("../../package.json");
const replaceInFile = require("../utils/replace_in_file");

const { logFatal } = require("../utils/log");

module.exports = (newPath) => {
  ensureNotInCurrentWorkingDir(newPath);
  fs.mkdirSync(newPath, { recursive: true });
  copyTemplateFiles(newPath);
  setupPackageDotJson(newPath);
}

const ensureNotInCurrentWorkingDir = (newPath) => {
  const fullPath = path.resolve(newPath);
  if (fullPath.startsWith(process.cwd())) {
    logFatal("Please specify a path outside of your current working directory");
  }
}

const repositoryName = (newPath) => {
  const pathNoTrailingSep = newPath.endsWith(path.sep) ? newPath.slice(0, -1) : newPath;
  const comps = pathNoTrailingSep.split(path.sep);
  return comps[comps.length - 1];
}

const copyTemplateFiles = (newPath) => {
  fse.copySync(`${__dirname}/template`, newPath);
  // copySync do not copy hidden field
  fs.renameSync(`${newPath}/gitignore`, `${newPath}/.gitignore`);
}

const setupPackageDotJson = (newPath) => {
  const data = {
    repository_name: repositoryName(newPath),
    etm_version: version
  };

  const newPackageDotJson = `${newPath}/package.json`;

  Object.entries(data).forEach(([key, value]) => {
    replaceInFile(newPackageDotJson, `--${key}--`, value)
  });
}
