#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const upload = require("../lib/release/upload");
const ApiClient = require("../lib/api_client");
const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

const {
  API_ENDPOINT,
  EMAIL_BUCKET_ROOT_DIR
} = require("../lib/constants");

const {
  logSuccess,
  logInfo,
  logUpload,
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
  eventmakerLocalEndpoint
} = argv;

const endpoint = local ? eventmakerLocalEndpoint : API_ENDPOINT;
const apiClient = new ApiClient(endpoint, token);

const coypEmailTheme = (theme, releaseDir, templateDir, cb) => {
  const originPath = path.join(".", templateDir, theme);
  console.log("originPath", originPath);
  const destPath = path.join(".", releaseDir, theme);
  console.log("destPath", destPath);
  deleteReleaseDir();
  fs.mkdirSync(destPath, { recursive: true });
  fse.copySync(originPath, destPath);
  cb();
}

const deleteReleaseDir = () => {
  fs.rmSync(EMAIL_BUCKET_ROOT_DIR, { recursive: true, force: true });
}

logInfo(`Starting upload for ${theme}`);
const releaseDir = EMAIL_BUCKET_ROOT_DIR;
const templateDir = `email_themes`;
coypEmailTheme(theme, releaseDir, templateDir, () => {
  logInfo(`Uploading emails for ${theme}, templateDir: ${templateDir}, releaseDir: ${releaseDir}`);
  upload(theme, ".", releaseDir, apiClient, false, (files) => {
    files.forEach(f => logUpload(f));
    logSuccess(`Emails for ${theme} has been uploaded`);
    deleteReleaseDir();
  });
});
