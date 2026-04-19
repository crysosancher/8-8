const { Router } = require("express");
const callStore = require("../store/callStore");

const router = Router();

/**
 * POST /api/webhook/vss
 * Receives Voice Session Summary (VSS) webhooks from 8x8.
 * Configure this URL in your 8x8 subaccount webhook settings.
 */
router.post("/vss", (req, res) => {
  const body = req.body;

  if (!body || !body.payload) {
    return res.status(400).json({ error: "Invalid VSS payload" });
  }

  if (body.namespace !== "VOICE" || body.eventType !== "SESSION_SUMMARY") {
    return res.status(400).json({ error: "Unsupported event type" });
  }

  callStore.addSession(body.payload);

  console.log(
    `[VSS] Session ${body.payload.sessionId} — status: ${body.payload.sessionStatus}`,
  );

  res.status(200).json({ received: true });
});

module.exports = router;
