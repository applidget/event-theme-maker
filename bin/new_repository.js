#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const createRepository = require("../lib/new_repository/create_repository");
const ensureThemeExists = require("../lib/new_repository/ensure_theme_exists");
const extractBaseTheme = require("../lib/new_repository/extract_base_theme");
const copySharedAssets = require("../lib/new_repository/copy_shared_assets");
const injectDependencies = require("../lib/new_repository/inject_dependencies");
const performInitialCommit = require("../lib/new_repository/perform_initial_commit");

const { logSuccess, log } = require("../lib/utils/log");

const argv = yargs(hideBin(process.argv))
  .config()
  .env("ETM")
  .options({
    "baseTheme": {
      alias: "b",
      describe: "The theme themes of this repository will be based on",
      demandOption: true
    },
    "path": {
      alias: "p",
      describe: "Path of the new repository",
      demandOption: true
    }
  })
  .help("help")
  .wrap(null)
  .argv;

const {
  baseTheme,
  path
} = argv;

ensureThemeExists(baseTheme);
createRepository(path);
extractBaseTheme(baseTheme, path);
copySharedAssets(path);
injectDependencies(baseTheme, path);
performInitialCommit(path, () => {
  summary();
});

const summary = () => {
  logSuccess(`New customer repository created at ${path} 😊.`);
  log("  1️⃣ go in the repository and run npm|yarn install");
  log(`  2️⃣ create a new theme npm|yarn run create-theme -- -n my-first-theme -b ${baseTheme}`);
  log("  3️⃣ share this repository with your customer by pushing on their remote Git");
  log("  4️⃣ ask an Eventmaker developer to allow theme development to your customer");
  log("  5️⃣ get started coding: npm|yarn run start -- -e YOUR_EVENT_ID -t YOUR_TOKEN -n my-first-theme");
  log("  6️⃣ once you are finished, publish your theme: npm|yarn run release -- -t YOUR_TOKEN -n my-first-theme" 🚀);
}
