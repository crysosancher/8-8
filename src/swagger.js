const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "8x8 KPI APIs",
    version: "1.0.0",
    description:
      "Voice KPI and webhook APIs for 8x8 CPaaS. Use this UI to test KPI, log export, and webhook endpoints.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "KPIs" },
    { name: "Logs" },
    { name: "Webhooks" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "8x8 API key as Bearer token. Optional: if omitted, server uses EIGHTX8_API_KEY from .env.",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Service health",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "8x8-kpi-apis" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/kpis/total-calls": {
      get: {
        tags: ["KPIs"],
        summary: "KPI: Total calls",
        parameters: [
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "Total calls KPI",
          },
        },
      },
    },
    "/api/kpis/success-rate": {
      get: {
        tags: ["KPIs"],
        summary: "KPI: Success rate",
        parameters: [
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "Success rate KPI",
          },
        },
      },
    },
    "/api/kpis/failure-rate": {
      get: {
        tags: ["KPIs"],
        summary: "KPI: Failure rate",
        parameters: [
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "Failure rate KPI",
          },
        },
      },
    },
    "/api/kpis/avg-duration": {
      get: {
        tags: ["KPIs"],
        summary: "KPI: Average duration",
        parameters: [
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "Average duration KPI",
          },
        },
      },
    },
    "/api/kpis/quality-score": {
      get: {
        tags: ["KPIs"],
        summary: "KPI: Quality score (MOS)",
        parameters: [
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "Average MOS KPI",
          },
        },
      },
    },
    "/api/kpis/status-breakdown": {
      get: {
        tags: ["KPIs"],
        summary: "KPI: Status breakdown",
        parameters: [
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "Status breakdown KPI",
          },
        },
      },
    },
    "/api/kpis/peak-hour": {
      get: {
        tags: ["KPIs"],
        summary: "KPI: Peak hour",
        parameters: [
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "Peak hour KPI",
          },
        },
      },
    },
    "/api/kpis/summary": {
      get: {
        tags: ["KPIs"],
        summary: "KPI summary",
        parameters: [
          {
            in: "query",
            name: "from",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
          {
            in: "query",
            name: "to",
            schema: { type: "string", format: "date-time" },
            required: false,
          },
        ],
        responses: {
          200: {
            description: "All KPI values in one response",
          },
        },
      },
    },
    "/api/webhook/vss": {
      post: {
        tags: ["Webhooks"],
        summary: "Receive 8x8 VSS webhook",
        description:
          "Used by 8x8 CPaaS Voice Session Summary callback. You can test manually from Swagger by posting a sample payload.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["namespace", "eventType", "payload"],
                properties: {
                  namespace: { type: "string", example: "VOICE" },
                  eventType: { type: "string", example: "SESSION_SUMMARY" },
                  description: {
                    type: "string",
                    example: "Summary of a completed call session",
                  },
                  payload: {
                    type: "object",
                    required: [
                      "sessionId",
                      "subAccountId",
                      "sessionStatus",
                      "startTime",
                      "endTime",
                    ],
                    properties: {
                      sessionId: {
                        type: "string",
                        example: "1f048a84-ea6d-11ee-911b-078f7290bf52",
                      },
                      subAccountId: { type: "string", example: "ThoughtSync" },
                      sessionStatus: {
                        type: "string",
                        example: "COMPLETED",
                      },
                      startTime: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-19T09:00:00Z",
                      },
                      endTime: {
                        type: "string",
                        format: "date-time",
                        example: "2026-04-19T09:00:22Z",
                      },
                      lastAction: { type: "string", example: "MAKE_CALL" },
                      callCount: { type: "integer", example: 1 },
                      details: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Webhook accepted",
          },
          400: {
            description: "Invalid webhook payload",
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
