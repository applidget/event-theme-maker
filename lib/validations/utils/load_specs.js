const yaml = require("js-yaml");
const fs = require("fs");

module.exports = (theme) => {
  return yaml.load(fs.readFileSync(`./themes/${theme}/specs.yml`, "utf8"));
}
