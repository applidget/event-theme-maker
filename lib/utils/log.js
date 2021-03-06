const logFatal = (str) => {
  logError(str);
  process.exit(1);
}

const logError = (str) => {
  console.error(`â ${str}`);
}

const wrapRed = (fn) => {
  console.log("\033[0;31m--------------------------------------\033[0m");
  fn();
  console.log("\033[0;31m--------------------------------------\033[0m");
}

const logInfo = (str) => {
  console.info(`âšī¸ ${str}`);
}

const logHelp = (str) => {
  console.info(`đĄ ${str}`);
}

const logUpload = (str) => {
  console.info(`â¤´ī¸ ${str} â`);
}

const log = (str) => {
  console.info(str);
}

const logSuccess = (str) => {
  console.info(`â ${str}`);
}

module.exports = {
  logFatal,
  logError,
  logUpload,
  logInfo,
  logHelp,
  log,
  wrapRed,
  logSuccess
}
