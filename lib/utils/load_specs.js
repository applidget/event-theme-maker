const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

module.exports = (theme, isWebsite = true) => {
  const specsPath = path.join(".", isWebsite ? "themes" : "email_themes", theme, "specs.yml");
  if (!fs.existsSync(specsPath)) {
    return null;
  }

  return yaml.load(fs.readFileSync(specsPath, "utf8"));
}
