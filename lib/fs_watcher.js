const chokidar = require("chokidar");
const { WATCH_PATH } = require("./constants");
const syncFiles = require("./sync_files");

module.exports = (apiClient, host, cb) => {
  const watcher = chokidar.watch(WATCH_PATH, {
    persistent: true,
    ignoreInitial: true
  });

  const syncFileHandler = (path) => {
    console.log(path);
    syncFiles(apiClient, [path], host, (ok, error) => {
      cb(path, ok, error);
    });
  }

  watcher
    .on('add', syncFileHandler)
    .on('change', syncFileHandler)
    .on('unlink', (path) => console.info("File destroyed:", path))
    .on('error', (error) => console.error("Watch File System error:", error))
}
