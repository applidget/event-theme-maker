const loadSpecs = require("./utils/load_specs");

module.exports = (theme) => {
  const specs = loadSpecs(theme);

  return ["sections", "layouts", "page_templates", "snippets"].flatMap(resource => {
    const filenames = specs[resource].map(r => r.filename);

    const occurrences = filenames.reduce((acc, name) => {
      acc[name] ? ++acc[name] : acc[name] = 1
      return acc;
    }, {});

    return Object.entries(occurrences).map(([name, count]) => {
      if (count > 1) {
        return `${name} defined multiple times in ${resource} specs.yml`;
      }
    });
  }).filter(e => e);
}
