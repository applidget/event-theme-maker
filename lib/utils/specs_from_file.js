const fs = require("fs");
const yaml = require("js-yaml");
const replaceAssetsHost = require("./replace_assets_host");

// from a file path, for example themes/standard/sections/title.liquid
// return the associated specs

const ERR_NOT_IN_SPECS = "err_not_in_specs";
const ERR_NO_SPECS = "err_no_specs"

const specsFromFile = (file, { devServer, hostToUse }) => {
  const pathComponents = file.split("/");

  const theme = pathComponents[1]; // theme name
  const type = pathComponents[2]; // type (sections, snippets, layouts ...)
  const filename = pathComponents.slice(3, pathComponents.length).join("/").replace(".liquid", "");

  const specsPath = `./themes/${theme}/specs.yml`
  if (!fs.existsSync(specsPath)) {
    return {error: ERR_NO_SPECS };
  }

  const specs = yaml.load(fs.readFileSync(specsPath, "utf8"));
  const fileSpecs = specs[type].find(({ filename: f }) => f === filename )

  if (!fileSpecs) {
    return {error: ERR_NOT_IN_SPECS };
  }

  return {
    element_specs: {
      ...fileSpecs,
      body: replaceAssetsHost(fs.readFileSync(file, "utf8"), devServer, hostToUse)
    },
    element_collection: type,
    theme
  };
}

module.exports = {
  ERR_NOT_IN_SPECS,
  ERR_NO_SPECS,
  specsFromFile
}
