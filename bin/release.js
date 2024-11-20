#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const buildAssets = require("../lib/release/build_assets");
const pack = require("../lib/release/pack");
const bundle = require("../lib/release/bundle");
const upload = require("../lib/release/upload");
const ApiClient = require("../lib/api_client");
const ensureThemeNotLocked = require("../lib/utils/ensure_theme_not_locked");

const {
  API_ENDPOINT,
  WEBSITE_BUCKET_ROOT_DIR
} = require("../lib/constants");

const {
  logSuccess,
  logInfo,
  logUpload,
  log
} = require("../lib/utils/log");

const argv = yargs(hideBin(process.argv))
  .env("ETM")
  .config()
  .options({
    "theme": {
      alias: "n",
      describe : "The name of the theme to release",
      demandOption: true
    },
    "token": {
      alias: "t",
      describe: "Your Eventmaker authentication token to access the REST API (find it on your profile page)",
      demandOption: true
    },
    "local": {
      alias: "l",
      describe: "Set to true if Eventmaker runs locally on my machine",
      boolean: true,
      default: false
    },
    "unsecure": {
      alias: "u",
      describe: "Bypass SSL error due to Company firewall",
      boolean: true,
      default: false
    },
    "eventmakerLocalEndpoint": {
      describe: "When using local=true specify the local endpoint of Eventmaker",
      default: "http://localhost:3000"
    }
  })
  .help("help")
  .wrap(null)
  .argv;

const {
  theme,
  token,
  local,
  unsecure,
  eventmakerLocalEndpoint
} = argv;

const endpoint = local ? eventmakerLocalEndpoint : API_ENDPOINT;
const apiClient = new ApiClient(endpoint, token, null, null, null, unsecure);

ensureThemeNotLocked(theme);

logInfo(`Starting build process for ${theme}`);
log("1️⃣ building assets...");
buildAssets(theme, () => {
  log("2️⃣ packaging theme...");
  pack(theme, WEBSITE_BUCKET_ROOT_DIR, (releaseDir, assetsDir) => {
    log("3️⃣ creating theme bundle...");
    bundle(theme, WEBSITE_BUCKET_ROOT_DIR, releaseDir, assetsDir, () => {
      log("4️⃣ publishing theme...");
      upload(theme, releaseDir, assetsDir, apiClient, true, (files) => {
        files.forEach(f => logUpload(f));
        logSuccess(`Theme ${theme} has been released`);
      });
    });
  });
});
