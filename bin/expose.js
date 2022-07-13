#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const startLocalServer = require("../lib/start_local_server");
const watchFileSystem = require("../lib/watch_file_system");
const syncFiles = require("../lib/utils/sync_files");
const stringify = require("../lib/utils/stringify");

const ApiClient = require("../lib/api_client");

const { API_ENDPOINT } = require("../lib/constants");

const {
  log,
  logFatal,
  logUpload,
  logInfo,
  wrapRed,
  logHelp
} = require("../lib/utils/log");

const argv = yargs(hideBin(process.argv))
  .options({
    "token": {
      alias: "a",
      describe: "Your Eventmaker auth token to access the REST API",
      demandOption: true
    },
    "eventId": {
      alias: "e",
      describe: "The Eventmaker event id you are working on",
      demandOption: true
    },
    "initialSync": {
      alias: "s",
      describe: "Wether or not the theme will be entirely synced on launch",
      boolean: true,
      default: false
    },
    "port": {
      alias: "p",
      describe: "the port used by the local server",
      default: 8000
    },
    "local": {
      alias: "l",
      describe: "Eventmaker run locally on my machine",
      boolean: true,
      default: false
    },
    "watchPath": {
      describe: "Auto sync folder",
      default: "./themes/**/*.liquid"
    },
    "devServer": {
      describe: "The Webpack Dev Server endpoint",
      default: "http://localhost:9999"
    },
    "eventmakerLocalEndpoint": {
      describe: "when using local=true specify the local endpoint of Eventmaker",
      default: "http://localhost:3000"
    }
  })
  .help("help")
  .argv;

const {
  token,
  eventId,
  initialSync,
  port,
  local,
  watchPath,
  devServer,
  eventmakerLocalEndpoint
} = argv;

const endpoint = local ? eventmakerLocalEndpoint : API_ENDPOINT;
const apiClient = new ApiClient(endpoint, token, eventId);

const fetchTheme = (cb) => {
  apiClient.fetchWebsite((ok, response) => {
    if (!ok) {
      logFatal(`error fetching website ${stringify(response)}`);
    }

    cb(response.theme_name);
  });
}

const syncLayouts = (theme, host, cb) => {
  const themeLayout = `themes/${theme}/layouts/theme.liquid`;
  const embedLayout = `themes/${theme}/layouts/embed.liquid`;
  const files = [themeLayout, embedLayout];

  syncFiles(apiClient, files, devServer, host, (ok, error) => {
    if (ok) {
      logUpload(themeLayout);
      logUpload(embedLayout);
      return cb();
    }

    logFatal(error);
  });
}

const performInitialSync = (theme, host, cb) => {
  if (!initialSync) {
    return syncLayouts(theme, host, cb);
  }

  logInfo("syncing the theme, please be patient...");
  logHelp("use --initialSync=false to avoid initial theme syncing");
  apiClient.themeFullSync(host, (ok, error) => {
    if (ok) {
      return cb();
    }

    wrapRed(() => log(stringify(error)));
    logFatal("error reloading theme");
  });
}

const startAutoSync = (host) => {
  watchFileSystem(watchPath, (file) => {
    syncFiles(apiClient, [file], devServer, host, (ok, error) => {
      if (ok) {
        return logUpload(file);
      }

      wrapRed(() => log(stringify(error)));
    });
  });
}

fetchTheme(theme => {
  logInfo(`working on 🚀 ${theme} 🚀`);
  startLocalServer({ port, expose: !local, devServer }, host => {
    performInitialSync(theme, host, () => {
      log(`✅ everything is ready ! Happy coding (host: ${host})`);
      startAutoSync(host);
    });
  });
});
