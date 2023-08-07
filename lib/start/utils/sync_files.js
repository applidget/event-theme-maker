const {
  ERR_NOT_IN_SPECS,
  ERR_NO_SPECS,
  ERR_NOT_SYNCHRONIZABLE,
  specsFromFile,
  ERR_SYNCING_SPECS
} = require("./specs_from_file");

const isFileForWebsite = require("./is_file_for_website");

const { logError, log, wrapOrange } = require("../../utils/log");

const syncFiles = (theme, apiClient, files, devServer, host, cb) => {
  const file = files.shift();

  const specs = specsFromFile(theme, file, { devServer, hostToUse: host });

  if (specs.error === ERR_NO_SPECS) {
    logError(`file ${file} not synced because the specs.yml file does not exist`);
    return;
  }

  if (specs.error === ERR_NOT_IN_SPECS) {
    logError(`file ${file} not synced because it is not in the specs.yml file`);
    return;
  }

  if (specs.error === ERR_NOT_SYNCHRONIZABLE) {
    wrapOrange(() => {
      log(`file ${file} not synced because it is not a file that can be synchronized at the moment`);
    })
    return;
  }

  if (specs.error === ERR_SYNCING_SPECS) {
    wrapOrange(() => {
      log("specs.yml is not synchronizable. If you defined a new file in the specs, you will need to make change to this file to synchronize it again 😊");
    })
    return;
  }

  const syncCallback = (ok, error) => {
    if (!ok) {
      return cb(ok, error);
    }

    if (files.length > 0) {
      return syncFiles(theme, apiClient, files, devServer, host, cb);
    }

    cb(ok, error);
  };

  if(isFileForWebsite(file)) {
    apiClient.themeIncrementalSync(specs, syncCallback);
  } else {
    apiClient.emailIncrementalSync(apiClient.emailId, specs, syncCallback);
  }
}

module.exports = syncFiles;
