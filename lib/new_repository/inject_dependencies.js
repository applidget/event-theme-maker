const fs = require("fs");

module.exports = (baseTheme, path) => {
  const basePackageDotJson = loadPackageJson(`./themes/${baseTheme}`);
  if (!basePackageDotJson) {
    return;
  }

  const newPackageDotJson = loadPackageJson(path);
  newPackageDotJson.dependencies = {
    ...(newPackageDotJson.dependencies || {}),
    ...(basePackageDotJson.dependencies || {})
  }

  // in case of mono repo, find also at the root of the folder
  const baseRepoPackageDotJson = loadPackageJson("./");
  if (baseRepoPackageDotJson) {
    newPackageDotJson.dependencies = {
      ...newPackageDotJson.dependencies,
      ...(baseRepoPackageDotJson.dependencies || {})
    }
  }

  fs.writeFileSync(`${path}/package.json`, JSON.stringify(newPackageDotJson, null, 2));
}

const loadPackageJson = (path) => {
  const fullPath = `${path}/package.json`;

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(fullPath));
}
