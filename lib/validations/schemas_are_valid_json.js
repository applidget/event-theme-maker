const fs = require("fs");
const liquidFiles = require("./utils/liquid_files");

module.exports = (theme) => {
  return liquidFiles(theme).map(filePath => {
    if (!fs.existsSync(filePath)) {
      return; // specs are validated in an other validation
    }

    const data = fs.readFileSync(filePath, "utf8");
    const indexOfSchema = data.indexOf("{% schema %}");

    if (indexOfSchema === -1) {
      return null;
    }

    const indexOfSchemaEnd = data.indexOf("{% endschema %}")

    const schema = data.substring(indexOfSchema + 12, indexOfSchemaEnd);
    return JSONError(schema, filePath);
  }).filter(e => e);
}

const JSONError = (str, file) => {
  try {
    const json = JSON.parse(str);
    if (Object.prototype.toString.call(json).slice(8, -1) !== "Object") {
      return "invalid JSON";
    }
  } catch (e) {
    return `Invalid JSON ${file}: ${e.message}`;
  }
  return null;
}
