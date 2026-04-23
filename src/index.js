const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const config = require("./config");
const swaggerSpec = require("./swagger");

const kpiRoutes = require("./routes/kpis");
const webhookRoutes = require("./routes/webhook");

const app = express();

app.use(express.json());

// CORS middleware - allow cross-origin requests
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : '*';
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Health check ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "8x8-kpi-apis" });
});

// --- Routes ---
app.use("/api/kpis", kpiRoutes);
app.use("/api/webhook", webhookRoutes);

// --- API Docs ---
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Start ---
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`SubAccount: ${config.eightx8.subAccountId}`);
  console.log(`Swagger UI: http://localhost:${config.port}/api-docs`);
});
