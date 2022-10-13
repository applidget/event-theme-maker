const fs = require("fs-extra");
const path = require("path");
const { logFatal } = require("../utils/log");
const yaml = require("js-yaml");
const loadSpecs = require("../utils/load_specs");
const replaceInFile = require("../utils/replace_in_file");

module.exports = (themeName, baseTheme) => {
  ensureBaseThemeExists(baseTheme);
  ensureUniqueName(themeName);
  const newThemeDir = path.join(".", "themes", themeName);
  createMainCSSFile(newThemeDir, baseTheme);
  createMainJSFile(newThemeDir, baseTheme);
  createLiquidFolders(newThemeDir);
  copyBaseThemeLayouts(newThemeDir, baseTheme);
  createSpecsFile(newThemeDir, themeName, baseTheme);
  copyPackageDotJSONIfAny(newThemeDir, themeName, baseTheme);
}

const existingThemes = () => {
  return fs.readdirSync(path.join(".", "themes"));
}

const ensureUniqueName = (theme) => {
  if (existingThemes().includes(theme)) {
    logFatal(`${theme} already exists`);
  }
}

const ensureBaseThemeExists = (theme) => {
  if (!existingThemes().includes(theme)) {
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

const copyBaseThemeLayouts = (newThemeDir, baseTheme) => {
  fs.copySync(path.join(".", "themes", baseTheme, "layouts"), path.join(newThemeDir, "layouts"));
}

const createSpecsFile = (newThemeDir, newTheme, baseTheme) => {
  const baseSpecs = loadSpecs(baseTheme);
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
  const newSpecsStr = yaml.dump(newSpecs);
  fs.writeFileSync(path.join(newThemeDir, "specs.yml"), newSpecsStr);
}

const copyPackageDotJSONIfAny = (newThemeDir, newTheme, baseTheme) => {
  const baseThemePackageJson = path.join(".", "themes", baseTheme, "package.json");
  if (!fs.existsSync(baseThemePackageJson)) {
    return;
  }

  const newThemePackageJson = path.join(newThemeDir, "package.json");
  fs.copySync(baseThemePackageJson, newThemePackageJson);
  replaceInFile(newThemePackageJson, baseTheme, newTheme);
}
