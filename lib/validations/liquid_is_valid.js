const fs = require("fs");

const liquidFiles = require("./utils/liquid_files");
const liquidEngine = require("./utils/liquid_engine");

module.exports = (theme) => {
  const liquid = liquidEngine();

  return liquidFiles(theme).map(filePath => {
    if (!fs.existsSync(filePath)) {
      return; // specs are validated in an other validation
    }
    const data = fs.readFileSync(filePath, "utf8");

    return liquidError(liquid, filePath, data);
  }).filter(e => e);
}

const liquidError = (liquid, file, data) => {
  try {
    liquid.parse(data);
  } catch (e) {
    // Skip validation errors for EventMaker's custom number_with_precision syntax
    if (e.message.includes('expected ":" after filter name') && data.includes('number_with_precision precision:')) {
      return null;
    }

    return `Failed to parse liquid ${file}: ${e.message}`;
  }
};
