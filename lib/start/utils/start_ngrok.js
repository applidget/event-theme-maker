const ngrok = require("ngrok");
const { logFatal } = require("../../utils/log");

module.exports = ({ port, ngrokToken }, callback) => {
  const options = ngrokConnectOptions({ port, ngrokToken });
  ngrok.connect(options)
    .then(host => {
      callback(host)
    })
    .catch(err => {
      logFatal(`something went wrong š¢: ${err}\nš” make sure this process is not already running and that the port ${port} is free`);
    });
}

const ngrokConnectOptions = ({ port, ngrokToken }) => {
  const options = {
    proto: "http",
    addr: port
  };
  if (ngrokToken) {
    options.authtoken = ngrokToken;
  }

  return options;
}
