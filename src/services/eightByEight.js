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

/**
 * Normalise a raw CDR/export record into the same shape that VSS webhooks
 * produce, so it can be stored in callStore without changes.
 */
function normalizeRecord(r) {
  return {
    sessionId: r.sessionId || r.session_id || r.id || null,
    subAccountId: r.subAccountId || r.sub_account_id || subAccountId,
    sessionStatus:
      r.sessionStatus || r.status || r.callStatus || r.call_status || "UNKNOWN",
    startTime: r.startTime || r.start_time || r.startdate || null,
    endTime: r.endTime || r.end_time || r.enddate || null,
    lastAction: r.lastAction || r.last_action || null,
    callCount: r.callCount || r.call_count || 1,
    errorDetails: r.errorDetails || r.error_details || null,
    details: r.details || r.legs || {},
  };
}

/**
 * Start a log-export job, poll until COMPLETED (up to ~60 s), then fetch and
 * return the records normalised into callStore shape.
 *
 * @param {string} from  ISO-8601 start datetime
 * @param {string} to    ISO-8601 end datetime
 * @param {string} [apiKeyOverride]
 * @returns {Promise<object[]>} Normalised session records
 */
async function syncSessionsFromExport(from, to, apiKeyOverride) {
  // 1. Start export job
  const job = await startLogExport(from, to, 0, apiKeyOverride);
  const jobId = job.jobId || job.id || job.exportId;
  if (!jobId) {
    throw new Error(
      `Could not determine jobId from export response: ${JSON.stringify(job)}`,
    );
  }

  // 2. Poll for completion (max 30 attempts × 2 s = 60 s)
  let result;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    result = await getLogExportResult(jobId, apiKeyOverride);
    const status = (result.status || result.jobStatus || "").toUpperCase();
    if (status === "COMPLETED" || status === "DONE") break;
    if (status === "FAILED" || status === "ERROR") {
      throw new Error(`Export job failed: ${JSON.stringify(result)}`);
    }
  }

  const finalStatus = (result.status || result.jobStatus || "").toUpperCase();
  if (finalStatus !== "COMPLETED" && finalStatus !== "DONE") {
    throw new Error(
      "Export job did not complete within 60 s. Try again later.",
    );
  }

  // 3. Retrieve records — either inline or via a presigned download URL
  const downloadUrl =
    result.url || result.downloadUrl || result.fileUrl || result.downloadLink;

  let rawRecords = [];

  if (downloadUrl) {
    const dlRes = await axios.get(downloadUrl);
    rawRecords = Array.isArray(dlRes.data)
      ? dlRes.data
      : dlRes.data?.records || dlRes.data?.data || [];
  } else {
    rawRecords = result.records || result.data || result.messages || [];
  }

  return rawRecords.map(normalizeRecord);
}

module.exports = {
  sendCallflow,
  startLogExport,
  getLogExportResult,
  syncSessionsFromExport,
  listWebhooks,
  createWebhook,
};
