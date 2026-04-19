const { Router } = require("express");
const eightByEight = require("../services/eightByEight");

const router = Router();

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

/**
 * POST /api/logs/export
 * Start a voice log export job for a date range.
 * Body: { "from": "2024-01-01", "to": "2024-01-31", "limit": 0 }
 */
router.post("/export", async (req, res) => {
  try {
    const { from, to, limit } = req.body;
    const token = getBearerToken(req);
    if (!from || !to) {
      return res.status(400).json({ error: "from and to are required" });
    }
    const data = await eightByEight.startLogExport(from, to, limit || 0, token);
    res.json(data);
  } catch (err) {
    console.error(
      "[LogExport] start error:",
      err.response?.data || err.message,
    );
    res.status(err.response?.status || 500).json({
      error: "Failed to start log export",
      details: err.response?.data || err.message,
    });
  }
});

/**
 * GET /api/logs/export/:jobId
 * Check the status / download link of an export job.
 */
router.get("/export/:jobId", async (req, res) => {
  try {
    const token = getBearerToken(req);
    const data = await eightByEight.getLogExportResult(req.params.jobId, token);
    res.json(data);
  } catch (err) {
    console.error(
      "[LogExport] result error:",
      err.response?.data || err.message,
    );
    res.status(err.response?.status || 500).json({
      error: "Failed to get log export result",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;
