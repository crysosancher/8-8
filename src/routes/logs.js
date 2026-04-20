const { Router } = require("express");

const router = Router();

/**
 * NOTE: 8x8 CPaaS Voice API does not provide REST endpoints for querying
 * historical session data or CDR exports. Session summaries are only
 * delivered via VSS webhooks (real-time events).
 *
 * To populate the KPI store with data:
 * 1. Expose this server to the internet (ngrok http 3000)
 * 2. Register your VSS webhook URL in 8x8 Connect portal
 * 3. 8x8 will deliver session events to /api/webhook/vss
 * 4. KPI endpoints will read from the populated store
 */

module.exports = router;
