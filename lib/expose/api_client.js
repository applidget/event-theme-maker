const https = require("https");
const http = require("http");
const url = require("url");

module.exports = class {
  constructor(endpoint, token, eventId) {
    this.token = token;
    this.basePath = `/api/v1/events/${eventId}`;
    this.endpoint = url.parse(endpoint);
  }

  fetchWebsite(cb) {
    this.start("GET", "website", "", (status, response) => {
      cb(status === 200, response)
    });
  }

  themeIncrementalSync(data, cb) {
    this.start("PUT", "website/incremental_theme_reload", data, (status, response) => {
      if (status === 204) {
        return cb(true);
      }
      cb(false, response);
    });
  }

  themeFullSync(ngrokHost, cb) {
    const data = {
      template_project_root: ngrokHost
    }

    this.start("PUT", "website/reload_theme", data, (status, response) => {
      if (status === 200) {
        return cb(true);
      }
      cb(false, response);
    });
  }

  start(method, path, data, cb) {
    const options = this.options(path, method);

    const req = this.httpClient().request(options, res => {
      let response = "";
      res.on("data", chunk => {
        response += chunk;
      });

      res.on("end", () => {
        cb(res.statusCode, JSON.parse(response || "{}"));
      });
    });

    req.on("error", error => {
      cb(-1, error);
    });

    req.write(JSON.stringify(data));
    req.end();
  }

  options(path, method) {
    return {
      hostname: this.endpoint.host.split(":")[0],
      path: `${this.basePath}/${path}.json?auth_token=${this.token}`,
      method,
      port: this.endpoint.port,
      headers: {
        "Content-Type": "application/json"
      }
    };
  }

  httpClient() {
    return this.endpoint.protocol === "http:" ? http : https;
  }
}
