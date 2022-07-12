const ngrok = require("ngrok");

module.exports = (port, callback) => {
  ngrok.connect(ngrokConnectOptions({ port }))
    .then(host => {
      callback(host)
    })
    .catch(err => {
      console.log(`❌ something went wrong 😢 (${JSON.stringify(err)})`);
      console.log(`💡 make sure this process is not already running or that the port ${port} is free`);
    });
}

function ngrokConnectOptions({ port }) {
  const options = {
    proto: "http",
    addr: port
  };
  if (process.env.NGROK_AUTH_TOKEN) {
    options.authtoken = process.env.NGROK_AUTH_TOKEN;
  }

  return options;
}
