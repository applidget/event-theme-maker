#!/usr/bin/env node

const startNgrok = require("../lib/ngrok").startNgrok;
const startLocalServer = require("../lib/local_server").startLocalServer;

console.log("expose");

startNgrok((host) => {
  console.log(`NGROK host is ${host}`);

  startLocalServer();
  console.log("local server running");
});
