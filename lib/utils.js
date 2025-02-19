const crypto = require('crypto');
const CONFIG = require('./config').CONFIG;
const assert = require('assert');

const SIGNATURE_ALGORITHM = 'sha256';

/**
 * Generates a HMAC-SHA1 digital signature for a bucket/key combination using the SECRET as the key
 * @param bucket the bucket name
 * @param key the key name
 * @returns {string} the digitally signed bucket+key combination
 */
const generateSignature = function (bucket, key) {
  assert(bucket !== undefined);
  assert(key !== undefined);
  assert(typeof CONFIG.SECRET === 'string', 'API key secret must be set for signatures to work');

  return crypto.createHmac(SIGNATURE_ALGORITHM, CONFIG.SECRET).update(internalId(bucket, key)).digest('hex');
};

/**
 * Given a bucket name and key, we'll return a S3 URL for it
 * @param bucket
 * @param key
 * @returns {string}
 */
const internalId = (bucket, key) => `s3://${bucket}/${key}`;

exports.formatTagValue = (value) => {
  if (value instanceof Array) {
    value = value.join(' ');
  }
  //we need to make sure we stay under the tag max length:
  let formattedValue = value.substr(0, 255);

  console.log('formatted tag value: ', formattedValue);
  return formattedValue;
};

const getScaniiAPISecrets = function() {
  const headers = {"X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN}
  const scaniiAPISecrets = process.env.SCANII_API_SECRETS_NAME;
  return fetch(`http://localhost:2773/secretsmanager/get?secretId=${scaniiAPISecrets}`, {
    method: 'GET',
    headers: headers,
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('API request failed with status: ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      return data.SecretString;
    })
};

exports.internalId = internalId;
exports.generateSignature = generateSignature;
exports.getScaniiAPISecrets = getScaniiAPISecrets;


