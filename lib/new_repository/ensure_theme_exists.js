const fs = require("fs");
const { logFatal } = require("../utils/log");

module.exports = (theme) => {
  if (!fs.existsSync(`./themes/${theme}`)) {
    logFatal(`${baseTheme} do not exists`);
  }
}
