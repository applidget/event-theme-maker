const path = require("path");
const fse = require("fs-extra");
const iterateThemeFiles = require("../utils/iterate_theme_files");

module.exports = (baseTheme, repository) => {
  iterateThemeFiles(baseTheme, file => {
    const comps = file.split(path.sep);
    // removing ./
    comps.splice(0, 1);
    const dest = comps.join(path.sep);

    fse.copySync(file, `${repository}/${dest}`);
  });

  const assetsPath = `themes/${baseTheme}/assets`;
  fse.copySync(`./${assetsPath}`, `${repository}/${assetsPath}`);
}
