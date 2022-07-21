#!/usr/bin/env node

const { execSync } = require("child_process");

try {
  execSync("./node_modules/.bin/jest", {
    stdio: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit'
  });
} catch(err) {
  process.exit(err.status);
}
