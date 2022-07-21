const {
  ERR_NOT_IN_SPECS,
  ERR_NO_SPECS,
  specsFromFile
} = require("./specs_from_file");

const { logError } = require("../../utils/log");

const syncFiles = (apiClient, files, devServer, host, cb) => {
  const file = files.shift();

  const specs = specsFromFile(file, { devServer, hostToUse: host });

  if (specs.error === ERR_NO_SPECS) {
    logError(`file ${file} not synced because the specs.yml file does not exist`);
    return;
  }

  if (specs.error === ERR_NOT_IN_SPECS) {
    logError(`file ${file} not synced because it is not in the specs.yml file`);
    return;
  }

  apiClient.themeIncrementalSync(specs, (ok, error) => {
    if (!ok) {
      return cb(ok, error);
    }

    if (files.length > 0) {
      return syncFiles(apiClient, files, devServer, host, cb);
    }

    cb(ok, error);
  });
}

module.exports = syncFiles;
