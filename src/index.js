const express = require("express");
const swaggerUi = require("swagger-ui-express");
const config = require("./config");
const swaggerSpec = require("./swagger");

const kpiRoutes = require("./routes/kpis");
const webhookRoutes = require("./routes/webhook");

const app = express();

app.use(express.json());

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
