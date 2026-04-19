const axios = require("axios");
const config = require("../config");

const { apiKey, subAccountId, voiceBaseUrl, logsBaseUrl } = config.eightx8;

const voiceClient = axios.create({
  baseURL: voiceBaseUrl,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
});

function buildAuthHeaders(apiKeyOverride) {
  return {
    Authorization: `Bearer ${apiKeyOverride || apiKey}`,
  };
}

const logsClient = axios.create({
  baseURL: logsBaseUrl,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
});

/**
 * Send a voice callflow (e.g. TTS voice message).
 */
async function sendCallflow(callflow, validUntil) {
  const body = { callflow };
  if (validUntil) body.validUntil = validUntil;
  const res = await voiceClient.post(
    `/subaccounts/${subAccountId}/callflows`,
    body,
  );
  return res.data;
}

/**
 * Start a voice log export job for a date range.
 */
async function startLogExport(from, to, limit = 0, apiKeyOverride) {
  const res = await logsClient.post(
    `/subaccounts/${subAccountId}/messages/exports`,
    { from, to, limit },
    { headers: buildAuthHeaders(apiKeyOverride) },
  );
  return res.data;
}

/**
 * Get the result / status of a voice log export job.
 */
async function getLogExportResult(jobId, apiKeyOverride) {
  const res = await logsClient.get(
    `/subaccounts/${subAccountId}/messages/exports/${encodeURIComponent(jobId)}`,
    { headers: buildAuthHeaders(apiKeyOverride) },
  );
  return res.data;
}

/**
 * List webhooks configured on the subaccount.
 */
async function listWebhooks() {
  const res = await voiceClient.get(`/subaccounts/${subAccountId}/webhooks`);
  return res.data;
}

/**
 * Create / register a webhook (VSS, VCS, VCA, etc.).
 */
async function createWebhook(type, url, enabled = true) {
  const res = await voiceClient.post(`/subaccounts/${subAccountId}/webhooks`, {
    type,
    url,
    enabled,
  });
  return res.data;
}

module.exports = {
  sendCallflow,
  startLogExport,
  getLogExportResult,
  listWebhooks,
  createWebhook,
};
