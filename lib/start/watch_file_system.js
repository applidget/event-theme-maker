const chokidar = require("chokidar");
const path = require("path");
const { logError, log } = require("../utils/log");

// chokidar v4+ dropped native glob support, so instead of passing a glob we
// watch the theme directories directly and keep only the files we care about
// by filtering on their extension.
const WATCHED_EXTENSIONS = [".liquid", ".json", ".yml"];

module.exports = (watchPaths, cb) => {
  const watcher = chokidar.watch(watchPaths, {
    persistent: true,
    ignoreInitial: true,
    // `stats` is undefined while chokidar traverses directories; we only ever
    // want to ignore actual files whose extension is not one we sync.
    ignored: (filePath, stats) =>
      !!stats && stats.isFile() && !WATCHED_EXTENSIONS.includes(path.extname(filePath)),
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  });

  watcher
    .on('add', cb)
    .on('change', cb)
    .on('unlink', (filePath) => log(`file destroyed: ${filePath}`))
    .on('error', (error) => logError(`watch file system error: ${error}`))
}
