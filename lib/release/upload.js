const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const walkSync = require("klaw-sync");
const map = require("async/map");
const mime = require("mime-types");

const {
  logFatal
} = require("../utils/log");

const stringify = require("../utils/stringify");

const { BUCKET, BUCKET_REGION } = require("../constants");

module.exports = (theme, releaseDir, assetsDir, apiClient, cb) => {
  fetchReleaseCredentials(theme, apiClient, (credentials) => {
    const files = filesToUpload(releaseDir, assetsDir);
    uploadRelease(credentials, files, cb);
  });
}

const fetchReleaseCredentials = (theme, apiClient, cb) => {
  apiClient.fetchReleaseCredentials(theme, (ok, response) => {
    if (!ok) {
      logFatal(`error fetching release credentials: ${stringify(response)}`);
    }
    cb(response);
  });
}

const filesToUpload = (releaseDir, assetsDir) => {
  const assets = walkSync(path.join(releaseDir, assetsDir), { nodir: true }).map(({ path }) => {
    return path.replace(`${process.cwd()}/`, "");
  });

  return [
    path.join(releaseDir, "bundle.tar.gz")
  ].concat(assets);
}

const s3Client = ({ access_key_id, secret_access_key, session_token }) => {
  return new S3Client({
    credentials: {
      accessKeyId: access_key_id,
      secretAccessKey: secret_access_key,
      sessionToken: session_token,
    },
    region: BUCKET_REGION
  });
}

const uploadFileHandler = (s3, baseParams) => {
  return (file, cb) => {
    const contentType = mime.lookup(file);

    const params = {
      ...baseParams,
      Key: file,
      Body: fs.readFileSync(file),
      ContentType: contentType || null
    };

    console.log(params);

    s3.send(new PutObjectCommand(params), (err) => {
      if (err) {
        return cb(err);
      }

      cb(null, params.Key);
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
    console.log(files);
    if (err) {
      logFatal(`error uploading file: ${stringify(err)}`);
    }
    cb(results);
  });
}
