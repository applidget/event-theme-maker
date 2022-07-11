const { DEV_HOST } = require("./constants");
const REPLACE_HOST_REGEX = new RegExp(DEV_HOST, "g");

module.exports = (content, ngrokHost) => {
  return content.replace(REPLACE_HOST_REGEX, ngrokHost);
}
