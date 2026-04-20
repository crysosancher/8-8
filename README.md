# 8x8 KPI APIs

Real-time KPI analytics for 8x8 Voice CPaaS, powered by VSS webhooks.

## Architecture

This server collects voice session data via **8x8 VSS (Voice Session Summary) webhooks** and exposes KPI endpoints that read from an in-memory store.

**Data Flow:**
1. 8x8 CPaaS Voice sends real-time VSS webhook events to `POST /api/webhook/vss`
2. Session data is stored in memory (`callStore`)
3. KPI endpoints query the store and compute metrics

**Why webhooks?**
- 8x8 CPaaS Voice API has no REST endpoint for querying historical CDR/session data
- VSS webhooks are the only way to receive session summaries
- Voice Analytics in 8x8 Connect portal are UI-only (no public API)

## Setup

### Local Development (Ngrok Required)

To receive VSS webhooks on localhost, expose your server via ngrok:

```bash
# Terminal 1: Start the server
npm install
npm start

# Terminal 2: Expose to internet
ngrok http 3000
```

### Register Webhook in 8x8 Connect

1. Go to https://connect.8x8.com (your account)
2. Navigate to **Settings > Webhooks** or **APIs & Credentials**
3. Register a new webhook:
   - **URL:** `https://<your-ngrok-id>.ngrok.io/api/webhook/vss`
   - **Event Type:** Voice Session Summary (VSS)
   - **Enabled:** Yes

4. 8x8 will start sending session events to your server
5. KPI endpoints will read the populated store

## Endpoints

### Health Check
- `GET /health` — Server status

### KPIs (Read from webhook store)
- `GET /api/kpis/total-calls` — Total voice sessions
- `GET /api/kpis/success-rate` — % of COMPLETED calls
- `GET /api/kpis/failure-rate` — % of failed/no-answer/busy calls
- `GET /api/kpis/avg-duration` — Average call length (seconds)
- `GET /api/kpis/quality-score` — Average MOS (Mean Opinion Score)
- `GET /api/kpis/status-breakdown` — Call count by status
- `GET /api/kpis/peak-hour` — UTC hour with most calls
- `GET /api/kpis/summary` — All KPIs in one response

**Query Parameters (all endpoints):**
- `from` — Start date/time (ISO 8601, optional, defaults to month start)
- `to` — End date/time (ISO 8601, optional, defaults to now)

Example:
```bash
curl http://localhost:3000/api/kpis/total-calls?from=2026-04-01&to=2026-04-30
```

### Webhooks
- `POST /api/webhook/vss` — Receive VSS events from 8x8 (internal use)

## Documentation

- Swagger UI: `http://localhost:3000/api-docs`
- Swagger JSON: `http://localhost:3000/api-docs.json`

## Environment Variables

```bash
PORT=3000
EIGHTX8_API_KEY=<your-api-key>
EIGHTX8_API_SECRET=<your-api-secret>
EIGHTX8_SUBACCOUNT_ID=<your-subaccount-id>
```
