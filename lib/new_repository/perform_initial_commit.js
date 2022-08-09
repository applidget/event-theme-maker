const { exec } = require("child_process");
const { logFatal } = require("../utils/log");

module.exports = (newPath, cb) => {
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
