const loadSpecs = require("../../utils/load_specs");

const { SPECS_FAKE_HOST } = require("../../constants");

module.exports = (theme) => {
  const specs = loadSpecs(theme);

  const localPaths = ["sections", "layouts", "page_templates", "snippets"].flatMap(resource => {
    return specs[resource].map(file => {
      return file.body_url.replace(`https://${SPECS_FAKE_HOST}`, "themes");
    });
  });

  return [...new Set(localPaths)];
}
