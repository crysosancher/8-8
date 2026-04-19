/**
 * In-memory store for voice call session data received via VSS webhooks.
 * Replace with a database (Postgres, Mongo, etc.) for production use.
 */

const sessions = [];

function addSession(payload) {
  sessions.push({
    sessionId: payload.sessionId,
    subAccountId: payload.subAccountId,
    sessionStatus: payload.sessionStatus,
    startTime: payload.startTime,
    endTime: payload.endTime,
    lastAction: payload.lastAction,
    callCount: payload.callCount,
    errorDetails: payload.errorDetails || null,
    details: payload.details || {},
    receivedAt: new Date().toISOString(),
  });
}

function getAllSessions() {
  return sessions;
}

function getSessionsByDateRange(from, to) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  return sessions.filter((s) => {
    const start = new Date(s.startTime);
    return start >= fromDate && start <= toDate;
  });
}

function clearSessions() {
  sessions.length = 0;
}

module.exports = {
  addSession,
  getAllSessions,
  getSessionsByDateRange,
  clearSessions,
};
