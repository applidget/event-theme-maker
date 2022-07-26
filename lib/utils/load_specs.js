const yaml = require("js-yaml");
const fs = require("fs");

module.exports = (theme) => {
  const specsPath = `./themes/${theme}/specs.yml`
  if (!fs.existsSync(specsPath)) {
    return null;
  }

  return yaml.load(fs.readFileSync(specsPath, "utf8"));
}
