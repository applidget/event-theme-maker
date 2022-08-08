const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const { version} = require("../../package.json");
const replaceInFile = require("../utils/replace_in_file");

const { logFatal } = require("../utils/log");

module.exports = (newPath, cb) => {
  ensureNotInCurrentWorkingDir(newPath);
  fs.mkdirSync(newPath, { recursive: true });
  copyTemplateFiles(newPath);
  setupPackageDotJson(newPath);
  setupGit(newPath, cb);
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
}

const setupPackageDotJson = (newPath) => {
  const data = {
    repository_name: repositoryName(newPath),
    etm_version: version
  };

  const newPackaggeDotJson = `${newPath}/package.json`;

  Object.entries(data).forEach(([key, value]) => {
    replaceInFile(newPackaggeDotJson, `--${key}--`, value)
  });
}

const setupGit = (newPath, cb) => {
  const gitInit = `git init`;
  const gitAdd = `git add .`;
  const gitCommit = `git commit -m "initial commit" || echo "No changes to commit"`;

  exec(`${gitInit} && ${gitAdd} && ${gitCommit}`, { cwd: newPath }, (error) => {
    if (error) {
      logFatal(`error setting up git ${error}`);
    }
    cb && cb();
  });
}

