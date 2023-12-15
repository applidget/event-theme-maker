const fs = require("fs");
const loadSpecs = require("../../utils/load_specs");
const replaceAssetsHost = require("./replace_assets_host");
const path = require("path");

// from a file path, for example themes/standard/sections/title.liquid
// return the associated specs

const ERR_NOT_IN_SPECS = "err_not_in_specs";
const ERR_NO_SPECS = "err_no_specs";
const ERR_NOT_SYNCHRONIZABLE = "err_not_synchronizable";
const ERR_SYNCING_SPECS = "err_syncing_specs";

const NO_SYNCHRONIZABLE_CONFIG_FILES = [
  "presets.en.json",
  "presets.fr.json"
]

const specsFromFile = (theme, file, { devServer, hostToUse }) => {
  const pathComponents = file.split(path.sep);

  if (pathComponents[pathComponents.length - 1] === "specs.yml") {
    return { error: ERR_SYNCING_SPECS };
  }

  const type = pathComponents[2]; // type (sections, snippets, layouts ...)
  const isConfigElement = type === 'config';

  const { fileKey, error } = specFileKeyFor(pathComponents, { isConfigElement });
  if (error) {
    return { error };
  }

  const mainFolder = pathComponents[0];
  const specs = loadSpecs(theme, mainFolder);
  if (!specs) {
    return { error: ERR_NO_SPECS };
  }

  if (!specs[type]) {
    return { error: ERR_NOT_SYNCHRONIZABLE };
  }

  let fileSpecs = Array.isArray(specs[type]) ? (
    specs[type].find(({ filename: f }) => f === fileKey)
  ) : (
    specs[type][fileKey]
  );

  if (!fileSpecs) {
    return { error: ERR_NOT_IN_SPECS };
  }

  if (isConfigElement) {
    fileSpecs = {
      filename: fileKey,
      body_url: fileSpecs
    };
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

const CONFIG_FILENAME_MAPPING = {
  "main_settings_schema.json": "main_settings",
  "sections-groups.json": "sections_groups"
}

const specFileKeyFor = (pathComponents, { isConfigElement }) => {
  const filename = pathComponents.slice(3, pathComponents.length).join(path.sep);

  if (isConfigElement) {
    if (NO_SYNCHRONIZABLE_CONFIG_FILES.includes(filename)) {
      return { error: ERR_NOT_SYNCHRONIZABLE };
    }
    return { fileKey: CONFIG_FILENAME_MAPPING[filename] || filename.replace(".json", "") };
  }

  return  { fileKey: filename.replace(".liquid", "") };
}

module.exports = {
  ERR_NOT_IN_SPECS,
  ERR_NO_SPECS,
  ERR_NOT_SYNCHRONIZABLE,
  ERR_SYNCING_SPECS,
  specsFromFile
}
