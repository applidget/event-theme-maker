const fs = require("fs");

module.exports = (path, reg, content) => {
  if (!fs.existsSync(path)) {
    return;
  }

  const data = fs.readFileSync(path, "utf8");
  const newData = data.replace(reg, content);
  fs.writeFileSync(path, newData, "utf8");
}
