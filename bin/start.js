#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const path = require("path");

const startLocalServer = require("../lib/start/start_local_server");
const startDevServer = require("../lib/start/start_dev_server");
const watchFileSystem = require("../lib/start/watch_file_system");
const syncFiles = require("../lib/start/utils/sync_files");
const stringify = require("../lib/utils/stringify");
const ensureThemeNotLocked = require("../lib/utils/ensure_theme_not_locked");

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
  .env("ETM")
  .config()
  .options({
    "token": {
      alias: "t",
      describe: "Your Eventmaker authentication token to access the REST API (find it on your profile page)",
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
    "theme": {
      alias: "n",
      describe: "The theme to work on. By default, the current event theme will be used. If the theme here is different than the website one, a full sync will be performed automatically"
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
      default: "./{document_themes,email_themes,themes}/**/*.{liquid,json,yml}"
    },
    "eventmakerLocalEndpoint": {
      describe: "When using local=true specify the local endpoint of Eventmaker",
      default: "http://localhost:3000"
    },
    "emailId": {
      alias: "m",
      describe: "The email id to work on. If not provided, automatic sync for email will not be done."
    },
    "documentId": {
      alias: "d",
      describe: "The document id to work on. If not provided, automatic sync for document will not be done."
    }
  })
  .help("help")
  .wrap(null)
  .argv;

const {
  token,
  eventId,
  theme: argvTheme,
  port,
  local,
  watchPath,
  eventmakerLocalEndpoint,
  emailId,
  documentId
} = argv;

let { initialSync } = argv; // this one may change if fetched theme != argTheme

const endpoint = local ? eventmakerLocalEndpoint : API_ENDPOINT;
const apiClient = new ApiClient(endpoint, token, eventId, emailId, documentId);

const fetchTheme = (cb) => {
  apiClient.fetchWebsite((ok, response) => {
    if (!ok) {
      logFatal(`error fetching website ${stringify(response)}`);
    }

    cb(response.theme_name);
  });
}

const layoutFile = (theme, layout) => {
  return path.join("themes", theme, "layouts", `${layout}.liquid`);
}

const syncLayouts = (theme, host, cb) => {
  const themeLayout = layoutFile(theme, "theme");
  const embedLayout = layoutFile(theme, "embed");
  const files = [themeLayout, embedLayout];

  syncFiles(theme, apiClient, files, devServer, host, (ok, error) => {
    if (ok) {
      logUpload(themeLayout);
      logUpload(embedLayout);
      return cb();
    }

    logFatal(stringify(error));
  });
}

const performInitialSync = (theme, host, cb) => {
  if (!initialSync) {
    return syncLayouts(theme, host, cb);
  }

  logInfo("syncing the theme, please be patient...");
  logHelp("use --initialSync=false to avoid initial theme syncing");

  let type, typeId;

  if (emailId) {
    type = "email";
    typeId = emailId;
  } else if (documentId) {
    type = "document";
    typeId = documentId;
  } else {
    type = "website";
  }

  apiClient.themeFullSync(host, type, typeId, (ok, error) => {
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

const updateWebsiteThemeIfNeeded = (theme, cb) => {
  if (!argvTheme || argvTheme === theme) {
    // by default use current website theme
    return cb(theme);
  }

  apiClient.changeWebsiteTheme(argvTheme, (ok, response) => {
    if (!ok) {
      logFatal(`unable to change website theme ${stringify(response)}`);
    }

    // argv theme and theme are different, we will force performming the initial sync
    initialSync = true;

    cb(argvTheme);
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

  if (emailId) {
    log("  - 📤 Email reloading")
  } else if (documentId) {
    log("  - 📄 Document reloading")
  } else {
    log("  - 🖥️ Website reloading")
  }

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
  updateWebsiteThemeIfNeeded(theme, (theme) => {
    ensureThemeNotLocked(theme);
    startDevServer(theme, () => {
      startLocalServer(theme, apiClient, { port, expose: !local, devServer }, host => {
        performInitialSync(theme, host, () => {
          startAutoSync(theme, host);
          summary(theme, host);
        });
      });
    });
  });
});
