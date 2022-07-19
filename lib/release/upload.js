const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const walkSync = require("klaw-sync");
const map = require("async/map");

const {
  logFatal
} = require("../utils/log");
const stringify = require("../utils/stringify");

const { BUCKET } = require("./constants");

module.exports = (theme, releaseDir, assetsDir, apiClient) => {
  fetchReleaseCredentials(theme, apiClient, (credentials) => {
    const files = filesToUpload(releaseDir, assetsDir);
    uploadRelease(credentials, files, (results) => {
      console.log(results);
    });
  });
}

const fetchReleaseCredentials = (theme, apiClient, cb) => {
  apiClient.fetchReleaseCredentials(theme, (ok, response) => {
    if (!ok) {
      logFatal(`error fetching pre-signed URL: ${stringify(response)}`);
    }
    cb(response);
  });
}

const filesToUpload = (releaseDir, assetsDir) => {
  const assets = walkSync(`${releaseDir}/${assetsDir}`, { nodir: true }).map(({ path }) => {
    return path.replace(process.cwd(), ".");
  });

  return [
    `${releaseDir}/bundle.tar.gz`
  ].concat(assets);
}

const s3Client = ({ access_key_id, secret_access_key, session_token }) => {
  return new AWS.S3({
    accessKeyId: access_key_id,
    secretAccessKey: secret_access_key,
    sessionToken: session_token
  });
}

const uploadFileHandler = (s3, baseParams) => {
  return (file, cb) => {
    const comps = file.split(path.sep)
    // removing ./
    comps.splice(0, 1);

    const params = {
      ...baseParams,
      Key: comps.join("/"),
      Body: fs.readFileSync(file, "utf-8")
    };

    s3.upload(params, (err, data) => {
      if (err) {
        return cb(err);
      }

      cb(null, data.Location);
    });
  };
}

const uploadRelease = (credentials, files, cb) => {
  const s3 = s3Client(credentials);

  const baseParams = {
    Bucket: BUCKET,
    ACL: "public-read"
  };

  const handler = uploadFileHandler(s3, baseParams);
  map(files, handler, (err, results) => {
    if (err) {
      logFatal(`error uploading file: ${stringify(err)}`);
    }
    cb(results);
  });
}
