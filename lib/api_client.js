const https = require("https");
const http = require("http");
const url = require("url");
const { Readable } = require("stream");

module.exports = class {
  constructor(endpoint, token, eventId = null) {
    this.token = token;
    this.eventId = eventId;
    this.basePath = `/api/v1`;
    this.endpoint = url.parse(endpoint);
    this.hostname = this.endpoint.host.split(":")[0];
  }

  fetchReleaseCredentials(theme, cb) {
    const data = { theme_name: theme };
    this.get("themes/release_temporary_credentials", data, (status, response) => {
      if (status === 200) {
        return cb(true, response.credentials);
      }
      cb(false, response.error);
    });
  }

  fetchNgrokToken(theme, cb) {
    const data = { theme_name: theme };
    this.get("themes/ngrok_token", data, (status, response) => {
      if (status === 200) {
        return cb(true, response.token);
      }
      cb(false, response.error);
    });
  }

  fetchWebsite(cb) {
    this.get(this.eventPath("website"), null, (status, response) => {
      cb(status === 200, response)
    });
  }

  changeWebsiteTheme(theme, cb) {
    const payload = {
      website: {
        theme_name: theme
      }
    };

    this.start("PUT", this.eventPath("website"), payload, (status, response) => {
      cb(status === 200, response);
    });
  }

  themeIncrementalSync(data, cb) {
    this.start("PUT", this.eventPath("website/incremental_theme_reload"), data, (status, response) => {
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

    this.start("PUT", this.eventPath("website/reload_theme"), data, (status, response) => {
      if (status === 200) {
        return cb(true);
      }
      cb(false, response);
    });
  }

  eventPath(path) {
    return `events/${this.eventId}/${path}`;
  }

  fullPath(path, urlData) {
    return `${this.basePath}/${path}.json?${new URLSearchParams(urlData).toString()}`;
  }

  get(path, data, cb) {
    let urlData = { auth_token: this.token };
    if (data) {
      urlData = { ...urlData, ...data };
    }

    const options = {
      hostname: this.hostname,
      path: this.fullPath(path, urlData),
      method: "GET",
      port: this.endpoint.port,
      headers: {
        "Content-Type": "application/json"
      }
    };

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

    req.end();
  }

  start(method, path, data, cb) {
    const urlData = { auth_token: this.token };
    const body = JSON.stringify(data);

    const options = {
      hostname: this.hostname,
      path: this.fullPath(path, urlData),
      method,
      port: this.endpoint.port,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

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

    const readable = new Readable();
    readable._read = () => {}; // Required to implement a readable stream
    readable.push(body);

    readable.pipe(req);
  }

  httpClient() {
    return this.endpoint.protocol === "http:" ? http : https;
  }
}
