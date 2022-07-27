#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const startLocalServer = require("../lib/start/start_local_server");
const startDevServer = require("../lib/start/start_dev_server");
const watchFileSystem = require("../lib/start/watch_file_system");
const syncFiles = require("../lib/start/utils/sync_files");
const stringify = require("../lib/utils/stringify");

const ApiClient = require("../lib/api_client");

const {
  API_ENDPOINT,
  DEV_SERVER_ENDPOINT: devServer
} = require("../lib/constants");

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
      alias: "t",
      describe: "Your Eventmaker authentication token to access the REST API (find it on your profifle page)",
      demandOption: true
    },
    "eventId": {
      alias: "e",
      describe: "The Eventmaker event id you are working on",
      demandOption: true
    },
    "initialSync": {
      alias: "s",
      describe: "Whether or not an initial theme syncing will be performed",
      boolean: true,
      default: false
    },
    "port": {
      alias: "p",
      describe: "The port used by the local server",
      default: 8000
    },
    "local": {
      alias: "l",
      describe: "Set to true if Eventmaker runs locally on my machine",
      boolean: true,
      default: false
    },
    "watchPath": {
      describe: "Auto sync folder",
      default: "./themes/**/*.liquid"
    },
    "eventmakerLocalEndpoint": {
      describe: "When using local=true specify the local endpoint of Eventmaker",
      default: "http://localhost:3000"
    }
  })
  .config()
  .env("ETM")
  .help("help")
  .wrap(null)
  .argv;

const {
  token,
  eventId,
  initialSync,
  port,
  local,
  watchPath,
  eventmakerLocalEndpoint,
  ngrokToken
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

  syncFiles(theme, apiClient, files, devServer, host, (ok, error) => {
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

const startAutoSync = (theme, host) => {
  watchFileSystem(watchPath, (file) => {
    syncFiles(theme, apiClient, [file], devServer, host, (ok, error) => {
      if (ok) {
        return logUpload(file);
      }

      wrapRed(() => log(stringify(error)));
    });
  });
}

const summary = (theme, host) => {
  log("✅ everything is ready 😊");
  log(`  - working on ${theme} on event ${eventId}`);
  log(`  - local server running at ${host}`);
  log(`  - webpack dev server running at ${devServer}`);
  initialSync ? (
    log(`  - local theme has been reloaded, assets will be fetched from the local server`)
  ) : (
    log(`  - theme layouts have been reloaded, assets will be fetched from the local server`)
  );

  local ? (
    log(`  - reaching Eventmaker at ${eventmakerLocalEndpoint}`)
  ) : (
    log(`  - reaching Eventmaker at ${API_ENDPOINT}`)
  );

  log(`  - liquid files in ${watchPath} will be automatically synchronized`);
  logHelp("You will see logs from webpack dev server and theme synchronisation. In case of issues, read the logs 😊");
  log("Happy coding 👩‍💻\n\n");
}

logInfo("starting development environment...");

fetchTheme(theme => {
  startDevServer(theme, () => {
    startLocalServer(theme, apiClient, { port, expose: !local, devServer }, host => {
      performInitialSync(theme, host, () => {
        startAutoSync(theme, host);
        summary(theme, host);
      });
    });
  });
});
