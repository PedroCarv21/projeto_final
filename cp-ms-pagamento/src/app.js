const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const webhookRoutes = require("./routes/webhookRoutes");
const requestLogger = require("./middlewares/requestLogger");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // 500 req/15min por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3001")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin não permitido pelo CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Gateway-Signature"],
    exposedHeaders: ["Content-Length"],
    credentials: true,
    maxAge: 600,
  })
);

app.options("*", cors());

// Parser RAW para webhooks assinados
app.use(
  "/api/webhooks/gateway",
  express.raw({ type: "application/json", inflate: true, limit: "1mb" })
);

// Parsers normais para demais rotas
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

// Rotas normais
app.use("/", routes);

// Rotas de webhook (precisam vir após o raw parser)
app.use("/api/webhooks", webhookRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
