const fs = require("fs-extra");
const path = require("path");
const { logFatal } = require("../utils/log");
const yaml = require("js-yaml");
const loadSpecs = require("../utils/load_specs");
const replaceInFile = require("../utils/replace_in_file");

module.exports = (themeName, baseTheme, type = "website") => {
  const validTypes = ["website", "email", "document"];
  if (!validTypes.includes(type)) {
    logFatal(`Unknown theme type: ${type}`);
  }

  const folderMap = {
    website: "themes",
    email: "email_themes",
    document: "document_themes"
  };

  const folder = folderMap[type];
  const newThemeDir = path.join(".", folder, themeName);

  ensureBaseThemeExists(baseTheme, folder);
  ensureUniqueName(themeName, folder);

  if (type === "website") {
    createMainCSSFile(newThemeDir, baseTheme);
    createMainJSFile(newThemeDir, baseTheme);
  }

  createLiquidFolders(newThemeDir);
  copyBaseThemeLayouts(newThemeDir, baseTheme, folder);
  createSpecsFile(newThemeDir, themeName, baseTheme, folder);

  if (type === "website") {
    copyPackageDotJSONIfAny(newThemeDir, themeName, baseTheme, folder);
  }
}

const existingThemes = (folder) => {
  return fs.readdirSync(path.join(".", folder));
}

const ensureUniqueName = (theme, folder) => {
  if (existingThemes(folder).includes(theme)) {
    logFatal(`${theme} already exists`);
  }
}

const ensureBaseThemeExists = (theme, folder) => {
  if (!existingThemes(folder).includes(theme)) {
    logFatal(`${theme} does not exist`);
  }
}

const createMainCSSFile = (newThemeDir, baseTheme) => {
   const content = `@import "../../../${baseTheme}/assets/css/main";\n`;
   fs.outputFileSync(path.join(newThemeDir, "assets", "css", "main.scss"), content);
}

const createMainJSFile = (newThemeDir, baseTheme) => {
  const content = `import "../../../${baseTheme}/assets/js/main";\n`
  fs.outputFileSync(path.join(newThemeDir, "assets", "js", "main.js"), content);
}

const createLiquidFolders = (newThemeDir) => {
  ["snippets", "sections", "config"].forEach(dir => {
    fs.outputFileSync(path.join(newThemeDir, dir, ".gitkeep"), "");
  });
}

const copyBaseThemeLayouts = (newThemeDir, baseTheme, folder) => {
  fs.copySync(path.join(".", folder, baseTheme, "layouts"), path.join(newThemeDir, "layouts"));
}

const createSpecsFile = (newThemeDir, newTheme, baseTheme, folder) => {
  const baseSpecs = loadSpecs(baseTheme, folder);
  // replacing layouts files only
  const newLayouts = baseSpecs.layouts.map(layout => {
    return {
      ...layout,
      body_url: layout.body_url.replace(baseTheme, newTheme)
    };
  });

  const newSpecs = {
    ...baseSpecs,
    layouts: newLayouts,
    key: newTheme
  };
  const newSpecsStr = yaml.dump(newSpecs, { lineWidth: -1, quotingType:'"',  forceQuotes: true });
  fs.writeFileSync(path.join(newThemeDir, "specs.yml"), newSpecsStr);
}

const copyPackageDotJSONIfAny = (newThemeDir, newTheme, baseTheme, folder) => {
  const baseThemePackageJson = path.join(".", folder, baseTheme, "package.json");
  if (!fs.existsSync(baseThemePackageJson)) {
    return;
  }

  const newThemePackageJson = path.join(newThemeDir, "package.json");
  fs.copySync(baseThemePackageJson, newThemePackageJson);
  replaceInFile(newThemePackageJson, baseTheme, newTheme);
}
