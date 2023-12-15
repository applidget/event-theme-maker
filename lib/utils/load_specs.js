const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

module.exports = (theme, folder = "themes") => {
  const specsPath = path.join(".", folder, theme, "specs.yml");
  if (!fs.existsSync(specsPath)) {
    return null;
  }

  return yaml.load(fs.readFileSync(specsPath, "utf8"));
}
