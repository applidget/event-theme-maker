const ngrok = require("ngrok");
const { logFatal } = require("../../utils/log");

module.exports = (port, callback) => {
  ngrok.connect(ngrokConnectOptions({ port }))
    .then(host => {
      callback(host)
    })
    .catch(err => {
      logFatal(`something went wrong 😢: ${err}\n💡 make sure this process is not already running or that the port ${port} is free`);
    });
}

const ngrokConnectOptions = ({ port }) => {
  const options = {
    proto: "http",
    addr: port
  };
  if (process.env.NGROK_AUTH_TOKEN) {
    options.authtoken = process.env.NGROK_AUTH_TOKEN;
  }

  return options;
}
