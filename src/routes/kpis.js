const { Router } = require("express");
const callStore = require("../store/callStore");

const router = Router();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSessions(req) {
  const { from, to } = req.query;
  if (from && to) {
    return callStore.getSessionsByDateRange(from, to);
  }
  return callStore.getAllSessions();
}

function extractCallLegs(sessions) {
  const legs = [];
  for (const s of sessions) {
    if (!s.details) continue;
    for (const key of Object.keys(s.details)) {
      legs.push({ ...s.details[key], sessionStatus: s.sessionStatus });
    }
  }
  return legs;
}

// ---------------------------------------------------------------------------
// KPI 1 — Total Calls
// GET /api/kpis/total-calls?from=&to=
// ---------------------------------------------------------------------------
router.get("/total-calls", (req, res) => {
  const sessions = getSessions(req);
  res.json({
    kpi: "total_calls",
    value: sessions.length,
    description: "Total number of voice call sessions",
  });
});

// ---------------------------------------------------------------------------
// KPI 2 — Call Success Rate
// GET /api/kpis/success-rate?from=&to=
// ---------------------------------------------------------------------------
router.get("/success-rate", (req, res) => {
  const sessions = getSessions(req);
  const total = sessions.length;
  const completed = sessions.filter(
    (s) => s.sessionStatus === "COMPLETED",
  ).length;
  const rate = total === 0 ? 0 : ((completed / total) * 100).toFixed(2);
  res.json({
    kpi: "call_success_rate",
    value: Number(rate),
    unit: "%",
    completed,
    total,
    description: "Percentage of calls with COMPLETED status",
  });
});

// ---------------------------------------------------------------------------
// KPI 3 — Call Failure Rate
// GET /api/kpis/failure-rate?from=&to=
// ---------------------------------------------------------------------------
router.get("/failure-rate", (req, res) => {
  const sessions = getSessions(req);
  const total = sessions.length;
  const failureStatuses = ["FAILED", "ERROR", "NO_ANSWER", "BUSY"];
  const failed = sessions.filter((s) =>
    failureStatuses.includes(s.sessionStatus),
  ).length;
  const rate = total === 0 ? 0 : ((failed / total) * 100).toFixed(2);
  res.json({
    kpi: "call_failure_rate",
    value: Number(rate),
    unit: "%",
    failed,
    total,
    description:
      "Percentage of calls with FAILED, ERROR, NO_ANSWER or BUSY status",
  });
});

// ---------------------------------------------------------------------------
// KPI 4 — Average Call Duration
// GET /api/kpis/avg-duration?from=&to=
// ---------------------------------------------------------------------------
router.get("/avg-duration", (req, res) => {
  const sessions = getSessions(req);
  const legs = extractCallLegs(sessions);
  const durations = legs
    .filter((l) => typeof l.callDuration === "number")
    .map((l) => l.callDuration);
  const avg =
    durations.length === 0
      ? 0
      : (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2);
  res.json({
    kpi: "avg_call_duration",
    value: Number(avg),
    unit: "seconds",
    sampleSize: durations.length,
    description: "Average call duration across all connected call legs",
  });
});

// ---------------------------------------------------------------------------
// KPI 5 — Average Call Quality (MOS)
// GET /api/kpis/quality-score?from=&to=
// ---------------------------------------------------------------------------
router.get("/quality-score", (req, res) => {
  const sessions = getSessions(req);
  const legs = extractCallLegs(sessions);
  const mosValues = legs
    .filter((l) => l.callQuality && typeof l.callQuality.mos === "number")
    .map((l) => l.callQuality.mos);
  const avg =
    mosValues.length === 0
      ? 0
      : (mosValues.reduce((a, b) => a + b, 0) / mosValues.length).toFixed(2);

  let rating = "N/A";
  if (mosValues.length > 0) {
    const v = Number(avg);
    if (v >= 4.3) rating = "Excellent";
    else if (v >= 4.0) rating = "Good";
    else if (v >= 3.6) rating = "Fair";
    else if (v >= 3.1) rating = "Poor";
    else rating = "Bad";
  }

  res.json({
    kpi: "avg_quality_score",
    value: Number(avg),
    rating,
    unit: "MOS (1.0–5.0)",
    sampleSize: mosValues.length,
    description:
      "Average Mean Opinion Score across call legs with quality data",
  });
});

// ---------------------------------------------------------------------------
// KPI 6 — Calls by Status Breakdown
// GET /api/kpis/status-breakdown?from=&to=
// ---------------------------------------------------------------------------
router.get("/status-breakdown", (req, res) => {
  const sessions = getSessions(req);
  const breakdown = {};
  for (const s of sessions) {
    const status = s.sessionStatus || "UNKNOWN";
    breakdown[status] = (breakdown[status] || 0) + 1;
  }
  res.json({
    kpi: "status_breakdown",
    value: breakdown,
    total: sessions.length,
    description:
      "Distribution of calls across session statuses (COMPLETED, NO_ANSWER, BUSY, CANCELED, FAILED, ERROR)",
  });
});

// ---------------------------------------------------------------------------
// KPI 7 — Peak Hour (bonus KPI)
// GET /api/kpis/peak-hour?from=&to=
// ---------------------------------------------------------------------------
router.get("/peak-hour", (req, res) => {
  const sessions = getSessions(req);
  const hourBuckets = {};
  for (const s of sessions) {
    if (!s.startTime) continue;
    const hour = new Date(s.startTime).getUTCHours();
    hourBuckets[hour] = (hourBuckets[hour] || 0) + 1;
  }
  let peakHour = null;
  let peakCount = 0;
  for (const [hour, count] of Object.entries(hourBuckets)) {
    if (count > peakCount) {
      peakHour = Number(hour);
      peakCount = count;
    }
  }
  res.json({
    kpi: "peak_hour",
    value: peakHour,
    callCount: peakCount,
    hourlyBreakdown: hourBuckets,
    description: "UTC hour with the most voice calls",
  });
});

// ---------------------------------------------------------------------------
// Summary — All KPIs in one response
// GET /api/kpis/summary?from=&to=
// ---------------------------------------------------------------------------
router.get("/summary", (req, res) => {
  const sessions = getSessions(req);
  const legs = extractCallLegs(sessions);
  const total = sessions.length;

  // Success / failure
  const completed = sessions.filter(
    (s) => s.sessionStatus === "COMPLETED",
  ).length;
  const failureStatuses = ["FAILED", "ERROR", "NO_ANSWER", "BUSY"];
  const failed = sessions.filter((s) =>
    failureStatuses.includes(s.sessionStatus),
  ).length;

  // Duration
  const durations = legs
    .filter((l) => typeof l.callDuration === "number")
    .map((l) => l.callDuration);
  const avgDuration =
    durations.length === 0
      ? 0
      : Number(
          (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2),
        );

  // Quality
  const mosValues = legs
    .filter((l) => l.callQuality && typeof l.callQuality.mos === "number")
    .map((l) => l.callQuality.mos);
  const avgMos =
    mosValues.length === 0
      ? 0
      : Number(
          (mosValues.reduce((a, b) => a + b, 0) / mosValues.length).toFixed(2),
        );

  // Breakdown
  const breakdown = {};
  for (const s of sessions) {
    const status = s.sessionStatus || "UNKNOWN";
    breakdown[status] = (breakdown[status] || 0) + 1;
  }

  res.json({
    totalCalls: total,
    successRate:
      total === 0 ? 0 : Number(((completed / total) * 100).toFixed(2)),
    failureRate: total === 0 ? 0 : Number(((failed / total) * 100).toFixed(2)),
    avgCallDuration: avgDuration,
    avgQualityScore: avgMos,
    statusBreakdown: breakdown,
  });
});

module.exports = router;
