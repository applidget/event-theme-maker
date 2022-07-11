const ngrok = require("ngrok");
const { NGROK_PORT } = require("./constants");

module.exports.startNgrok = (callback) => {
  (async () => {
    const host = await ngrok.connect(ngrokConnectOptions());
    callback(host);
  })().catch(err => {
    console.log(`❌ something went wrong 😢 (${err})`);
    console.log(`💡 make sure this process is not already running or that the port ${NGROK_PORT} is free`);
  });
}

function ngrokConnectOptions() {
  const options = {
    proto: "http",
    addr: NGROK_PORT
  };
  if (process.env.NGROK_AUTH_TOKEN) {
    options.authtoken = process.env.NGROK_AUTH_TOKEN;
  }

  return options;
}
