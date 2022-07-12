const logFatal = (str) => {
  logError(str);
  process.exit(1);
}

const logError = (str) => {
  console.error(`❌ ${str}`);
}

const wrapRed = (fn) => {
  console.log("\033[0;31m--------------------------------------\033[0m");
  fn();
  console.log("\033[0;31m--------------------------------------\033[0m");
}

const logInfo = (str) => {
  console.info(`ℹ️ ${str}`);
}

const logUpload = (str) => {
  console.info(`⤴️ ${str} ✅`);
}

const log = (str) => {
  console.info(str);
}

module.exports = {
  logFatal,
  logError,
  logUpload,
  logInfo,
  log,
  wrapRed
}