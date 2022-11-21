const path = require("path");
const fse = require("fs-extra");
const iterateThemeFiles = require("../utils/iterate_theme_files");
const { lock } = require("../utils/lock_file");

module.exports = (baseTheme, repository) => {
  const baseThemesUsed = new Set();

  iterateThemeFiles(baseTheme, file => {
    const comps = file.split(path.sep);
    const dest = comps.join(path.sep);

    baseThemesUsed.add(comps[1]);

    fse.copySync(file, `${repository}/${dest}`);
  });

  // include assets
  const assetsPath = `themes/${baseTheme}/assets`;
  fse.copySync(`./${assetsPath}`, `${repository}/${assetsPath}`);

  Array.from(baseThemesUsed).forEach(theme => {
    lock(theme, { rootDirectory: repository });
  });
}
