const fs = require("fs");
const _ = require("lodash");

const loadSpecs = require("./utils/load_specs");
const { SPECS_FAKE_HOST } = require("../constants");

module.exports = (theme) => {
  const specs = loadSpecs(theme);
  const localPath = specs.config.translations.replace(`https://${SPECS_FAKE_HOST}`, "themes");
  const translations = JSON.parse(fs.readFileSync(localPath, "utf8"));

  const translationsKeys = Object.keys(translations).map(locale => {
    return {
      locale,
      keys: Object.keys(translations[locale])
    };
  });

  const base = translationsKeys[0];

  return translationsKeys.flatMap(({ locale, keys }) => {
    const diff1 = _.difference(base.keys, keys);
    const diff2 = _.difference(keys, base.keys);

    if (diff1.length === 0 && diff2.length === 0) {
      return;
    }

    const errors = [];

    if (diff1.length > 0) {
      errors.push(`missing translations ${diff1.join(", ")} for locale ${locale}`);
    }

    if (diff2.length > 0) {
      errors.push(`missing translations ${diff2.join(", ")} for locale ${base.locale}`);
    }
    return errors;
  }).filter(e => e);
}
