module.exports = (content, devServer, host) => {
  const reg = new RegExp(devServer, "g")
  return content.replace(reg, host);
}
