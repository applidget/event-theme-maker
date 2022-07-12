#!/usr/bin/env node

const startLocalServer = require("../lib/local_server");
const startFsWatcher = require("../lib/fs_watcher");
const ApiClient = require("../lib/api_client");
const { PORT, API_ENDPOINT, LOCAL_ENDPOINT } = require("../lib/constants");
const syncFiles = require("../lib/sync_files");

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

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
    "sync": {
      alias: "s",
      describe: "Wether or not the theme will be entirely synced on launch",
      boolean: true,
      default: false
    },
    "port": {
      alias: "p",
      describe: "the port used by the local server",
      default: PORT
    },
    "local": {
      alias: "l",
      describe: "Eventmaker run locally on my machine",
      boolean: true,
      default: false
    }
  })
  .help("help")
  .argv;

const {
  token,
  eventId,
  sync,
  port,
  local
} = argv;

const endpoint = local ? LOCAL_ENDPOINT : API_ENDPOINT;
const apiClient = new ApiClient(endpoint, token, eventId);

const fetchTheme = (cb) => {
  apiClient.fetchWebsite((ok, response) => {
    if (!ok) {
      console.error(`❌ error fetching website ${JSON.stringify(response)}`);
      process.exit(1);
    }

    cb(response.theme_name);
  });
}

const syncLayouts = (theme, host, cb) => {
  const themeLayout = `themes/${theme}/layouts/theme.liquid`;
  const embedLayout = `themes/${theme}/layouts/embed.liquid`;
  const files = [themeLayout, embedLayout];

  syncFiles(apiClient, files, host, (ok, error) => {
    if (ok) {
      console.log(`⤴️ ${themeLayout} ✅`);
      console.log(`⤴️ ${embedLayout} ✅`);
      return cb();
    }

    console.log(error);
    process.exit(1);
  })
}

const performInitialSync = (theme, host, cb) => {
  if (!sync) {
    return syncLayouts(theme, host, cb);
  }

  apiClient.themeFullSync(host, (ok, error) => {
    if (ok) {
      return cb();
    }

    console.error(`❌ error reloading theme ${JSON.stringify(error)}`);
    process.exit(1);
  });
}

const watchFileSystem = (host) => {
  startFsWatcher(apiClient, host, (file, ok, error) => {
    if (ok) {
      return console.log(`⤴️ ${file} ✅`);
    }

    console.log("\033[0;31m--------------------------------------\033[0m");
    console.log(error);
    console.log("\033[0;31m--------------------------------------\033[0m");
  });
}

fetchTheme(theme => {
  console.log(`Working on ${theme}`);
  startLocalServer({ port, expose: !local }, host => {
    console.log(`local server ${host}`);
    performInitialSync(theme, host, () => {
      console.log("✅ theme reloaded");
      console.log(`watching filesystem ${host}`);
      watchFileSystem(host);
    });
  });
})

