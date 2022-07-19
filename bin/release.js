#!/usr/bin/env node

const pack = require("../lib/release/pack");
const bundle = require("../lib/release/bundle");
const upload = require("../lib/release/upload");
const ApiClient = require("../lib/api_client");

const apiClient = new ApiClient("http://localhost:3000", "HzaYiGz5mV29xX3x5rib");

const buildDir = "builds-exp";

pack("grand-conference", buildDir, (releaseDir, assetsDir) => {
  console.log("ok", releaseDir, assetsDir);
  bundle("grand-conference", buildDir, releaseDir, assetsDir, () => {
    upload("grand-conference", releaseDir, assetsDir, apiClient, () => {
      console.log("release completed");
    });
  });
});
