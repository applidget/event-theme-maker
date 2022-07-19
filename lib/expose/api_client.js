const https = require("https");
const http = require("http");
const url = require("url");

module.exports = class {
  constructor(endpoint, token, eventId = null) {
    this.token = token;
    this.eventId = eventId;
    this.basePath = `/api/v1`;
    this.endpoint = url.parse(endpoint);
  }

  fetchReleasePresignedUrl(cb) {
    this.start("GET", "theme_release_pre_signed_url", "", (status, response) => {
      if (status === 200) {
        return cb(true, response.url);
      }
      cb(false, response.error);
    });
  }

  fetchWebsite(cb) {
    this.start("GET", eventPath("website"), "", (status, response) => {
      cb(status === 200, response)
    });
  }

  themeIncrementalSync(data, cb) {
    this.start("PUT", eventPath("website/incremental_theme_reload"), data, (status, response) => {
      if (status === 204) {
        return cb(true);
      }
      cb(false, response);
    });
  }

  themeFullSync(host, cb) {
    const data = {
      template_project_root: host
    }

    this.start("PUT", eventPath("website/reload_theme"), data, (status, response) => {
      if (status === 200) {
        return cb(true);
      }
      cb(false, response);
    });
  }

  eventPath(path) {
    return `events/${this.eventId}/${path}`;
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
