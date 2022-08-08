#!/usr/bin/env node

const fs = require("fs");

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const {
  logError,
  logSuccess,
  logFatal,
  log
} = require("../lib/utils/log");

const liquidIsValid = require("../lib/validations/liquid_is_valid");
const schemasAreValidJson = require("../lib/validations/schemas_are_valid_json");
const specsLinkToExistingResources = require("../lib/validations/specs_link_to_existing_resources");
const specsNoDuplicate = require("../lib/validations/specs_no_duplicate");
const exhaustiveLocales = require("../lib/validations/exhaustive_locales");

const argv = yargs(hideBin(process.argv))
  .config()
  .env("ETM")
  .options({
    "theme": {
      alias: "n",
      describe : "The name of the theme to validate. If not specified, all themes will be validated (in the themes/ directory)"
    },
  })
  .help("help")
  .wrap(null)
  .argv;

const themes = () => {
  if (argv.theme) {
    return [argv.theme];
  }

  return fs.readdirSync("./themes");
}

themes().forEach(theme => {
  if (!fs.existsSync(`./themes/${theme}`)) {
    logFatal(`theme ${theme} not found`);
  }

  log(`Validating theme ${theme}`);
  const errors = [
    liquidIsValid(theme),
    schemasAreValidJson(theme),
    specsLinkToExistingResources(theme),
    specsNoDuplicate(theme),
    exhaustiveLocales(theme)
  ].flat();

  if (errors.length === 0) {
    logSuccess("all validations passed 👍");
    return;
  }

  errors.forEach(error => {
    logError(error);
  });
  logFatal("validation failed");
});

