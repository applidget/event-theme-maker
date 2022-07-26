const fs = require("fs");
const path = require("path");
const loadSpecs = require("../utils/load_specs");

const { SPECS_FAKE_HOST } = require("../constants");

module.exports = (theme) => {
  const specs = loadSpecs(theme);

  const resources = [];

  ["sections", "layouts", "page_templates", "snippets"].forEach(resource => {
    specs[resource].forEach(resource => {
      resources.push(resource.body_url);
    });
  });

  const config = specs.config;

  ["main_settings", "translations"].forEach(resource => {
    resources.push(config[resource]);
  });

  Object.keys(config.presets.default).forEach(key => {
    const preset = config.presets.default[key];
    resources.push(preset);
  });


  return resources.map(resource => {
    const localPath = resource.replace(`https://${SPECS_FAKE_HOST}`, "themes");

    if (!fs.existsSync(localPath)) {
      return `expect ${localPath} to exists because its defined in the specs.yml file`;
    }

    const pathComponents = localPath.split(path.sep);
    const themeFolder = pathComponents[1];
    if (themeFolder === specs.key) return;

    pathComponents[1] = specs.key;
    const otherPath = pathComponents.join(path.sep);

    if (fs.existsSync(otherPath)) {
      return `resource ${otherPath} exists in the theme folder but is taken from another theme (${themeFolder})`
    }
  }).filter(e => e);
}
