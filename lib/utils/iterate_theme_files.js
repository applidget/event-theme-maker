const path = require("path");
const loadSpecs = require("./load_specs");
const {
  SPECS_FAKE_HOST
} = require("../constants");

module.exports = (theme, block) => {
  themeFiles(theme).forEach(block);
}

const themeFiles = (theme) => {
  const specs = loadSpecs(theme);

  let files = [];

  ["sections", "layouts", "page_templates", "snippets"].forEach(key => {
    files = files.concat(elementsPaths(specs, key));
  });

  files.push(urlToPath(specs.config.main_settings));
  files.push(urlToPath(specs.config.presets.default.fr));
  files.push(urlToPath(specs.config.presets.default.en));
  files.push(urlToPath(specs.config.translations));
  files.push(urlToPath(specs.config.sections_groups));

  files.push(path.join(".", "themes", theme, "specs.yml"));

  return files;
}

const elementsPaths = (specs, key) => {
  return specs[key].map(e => urlToPath(e.body_url));
}

// convert URL contained in specs files to locale path on the file system
const urlToPath = (url) => {
  const fullPath = url.replace(`https://${SPECS_FAKE_HOST}`, "./themes");

  // converting / in specs to \ if on windows
  return path.join(fullPath.split("/"));
}
