// filepath: /home/gabriel-garrido/Workspaces/Senac/cp-ms-pagamento/src/routes/webhookRoutes.js
const express = require("express");
const WebhookController = require("../controllers/WebhookController");

const router = express.Router();
const controller = new WebhookController();

// Recebe webhooks do gateway simulado
router.post("/gateway", (req, res) =>
  controller.handleGatewayWebhook(req, res)
);

module.exports = router;
