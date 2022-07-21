const fs = require("fs");
const yaml = require("js-yaml");
const {
  liquidFiles,
  isValidJSON,
  isValidLiquid
} = require("./liquid.js");

const { logError } = require("../utils/log");

const { SPECS_FAKE_HOST } = require("../constants");

test("Themes specifications should point to existing resources", () => {
  const themes = fs.readdirSync("./themes");

  themes.forEach(theme => {
    const specs = yaml.load(fs.readFileSync(`./themes/${theme}/specs.yml`, "utf8"));

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

    // every resources should point to an existing file and should point to the theme folder if it exists
    resources.forEach(resource => {
      const localPath = resource.replace(`https://${SPECS_FAKE_HOST}`, "themes");
      expect(fs.existsSync(localPath)).toBe(true);

      const pathComponents = localPath.split("/");
      const themeFolder = specs.key;
      if (themeFolder == specs.key) return;

      pathComponents[2] = specs.key;
      const path = pathComponents.join("/");

      // resource is defined in theme folder but is not used"
      expect(fs.existsSync(path)).toBe(false);
    });
  });
});

test("Themes specifications should not have duplicated filenames", () => {
  const themes = fs.readdirSync("./themes");

  themes.forEach(theme => {
    const specs = yaml.load(fs.readFileSync(`./themes/${theme}/specs.yml`, "utf8"));

    ["sections", "layouts", "page_templates", "snippets"].forEach(resource => {
      const filenames = specs[resource].map(r => r.filename);
      const uniqueFilenames = Array.from(new Set(filenames));

      expect(filenames).toEqual(uniqueFilenames);
    });
  });
});

test("Standard translations are merged", () => {
  const specs = yaml.load(fs.readFileSync(`./themes/standard/specs.yml`, "utf8"));

  const localPath = specs.config.translations.replace(`https://${SPECS_FAKE_HOST}`, "themes");
  const translations = JSON.parse(fs.readFileSync(localPath, "utf8"));

  const translationsKeys = [];
  Object.keys(translations).forEach(locale => {
    translationsKeys.push(Object.keys(translations[locale]));
  });


  const enTranslations = JSON.parse(fs.readFileSync("themes/standard/translations/en.json", "utf8"));
  const enTranslationsKeys = Object.keys(enTranslations).sort();


  translationsKeys.forEach(keys => {
    expect(keys.sort()).toEqual(enTranslationsKeys);
  })
});

test("Themes locale should be exhaustive in all languages", () => {
  const themes = fs.readdirSync("./themes");

  themes.forEach(theme => {
    const specs = yaml.load(fs.readFileSync(`./themes/${theme}/specs.yml`, "utf8"));

    const localPath = specs.config.translations.replace(`https://${SPECS_FAKE_HOST}`, "themes");
    const translations = JSON.parse(fs.readFileSync(localPath, "utf8"));

    const translationsKeys = [];
    Object.keys(translations).forEach(locale => {
      translationsKeys.push(Object.keys(translations[locale]));
    });

    const base = translationsKeys[0].sort();
    translationsKeys.forEach(keys => {
      expect(keys.sort()).toEqual(base);
    })
  });
});

test("Themes settings should be valid JSON", () => {
  liquidFiles().forEach(filePath => {
    const data = fs.readFileSync(filePath, "utf8");
    const indexOfSchema = data.indexOf("{% schema %}");

    if (indexOfSchema !== -1) {
      const indexOfSchemaEnd = data.indexOf("{% endschema %}")

      const subData = data.substring(indexOfSchema + 12, indexOfSchemaEnd);

      const valid = isValidJSON(subData);
      if (!valid) {
        logError(`file ${filePath} has invalid schema`);
      }

      expect(valid).toBe(true);
    }
  });
});

test("Themes liquid files should be valid liquid", () => {
  liquidFiles().forEach(filePath => {
    const data = fs.readFileSync(filePath, "utf8");

    const valid = isValidLiquid(data);
    if (!valid) {
      logError(`file ${filePath} is invalid liquid`);
    }

    expect(valid).toBe(true);
  });
});
