const { logFatal } = require("./log");
const { isLocked } = require("./lock_file");

module.exports = (theme) => {
  if (!isLocked(theme)) {
    return;
  }

  logFatal(`theme ${theme} is locked and should not be used with command ${process.argv[1]}`);
}
