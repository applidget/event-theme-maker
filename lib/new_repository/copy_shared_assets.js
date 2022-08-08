const fs = require("fs-extra");

module.exports = (repository) => {
  if (!fs.existsSync("./shared")) {
    return;
  }

  fs.copySync("./shared", `${repository}/shared`);
}