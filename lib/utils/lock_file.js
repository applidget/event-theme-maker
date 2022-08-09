const fs = require("fs-extra");

const LOCK_FILE = ".locked";
const LOCK_FILE_CONTENT = "This theme should not be used. It was created automatically. Override files in your own theme if needed";

const lockFile = (theme, { rootDirectory } = {}) => {
  const root = `${rootDirectory || "."}/themes`;
  return `${root}/${theme}/${LOCK_FILE}`;
}

const isLocked = (theme, { rootDirectory } = {}) => {
  return fs.existsSync(lockFile(theme, { rootDirectory }));
}

const lock = (theme, { rootDirectory } = {}) => {
  if (isLocked(theme, { rootDirectory })) {
    return;
  }

  fs.outputFileSync(lockFile(theme, { rootDirectory }), LOCK_FILE_CONTENT);
}

module.exports = {
  lock,
  isLocked
}
