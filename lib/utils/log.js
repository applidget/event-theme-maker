const WRAP_LINE = "--------------------------------------";

const logFatal = (str) => {
  logError(str);
  process.exit(1);
}

const logError = (str) => {
  console.error(`❌ ${str}`);
}

const wrapRed = (fn) => {
  wrapColor(31, fn);
}

const wrapOrange = (fn) => {
  wrapColor(33, fn);
}

const wrapColor = (colorCode, fn) => {
  wrapLine(colorCode);
  fn();
  wrapLine(colorCode);
}

const wrapLine = (colorCode) => {
  console.log("\033[0;" + colorCode + "m" + WRAP_LINE + "\033[0m");
}

const logInfo = (str) => {
  console.info(`ℹ️ ${str}`);
}

const logHelp = (str) => {
  console.info(`💡 ${str}`);
}

const logUpload = (str) => {
  console.info(`⤴️ ${str} ✅`);
}

const log = (str) => {
  console.info(str);
}

const logSuccess = (str) => {
  console.info(`✅ ${str}`);
}

module.exports = {
  logFatal,
  logError,
  logUpload,
  logInfo,
  logHelp,
  log,
  wrapRed,
  wrapOrange,
  logSuccess
}
