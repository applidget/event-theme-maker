#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const createTheme = require("../lib/new_theme/create_theme");
const { logSuccess } = require("../lib/utils/log");

const argv = yargs(hideBin(process.argv))
  .env("ETM")
  .config()
  .options({
    "theme": {
      alias: "n",
      describe : "The name of the new theme",
      demandOption: true
    },
    "baseTheme": {
      alias: "b",
      describe: "The name of the theme to use as a base",
      demandOption: true
    },
    "type": {
      alias: "t",
      describe: "The kind of theme",
      choices: ["website", "email", "document"],
      default: "website"
    }
  })
  .help("help")
  .wrap(null)
  .argv;

const {
  theme,
  baseTheme,
  type
} = argv;

createTheme(theme, baseTheme, type);

logSuccess(`Theme ${theme} is ready 🚀\nMake sure to ask the Eventmaker team to allow you to work on this new theme.`);
