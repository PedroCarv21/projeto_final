const express = require("express");
const paymentMethodRoutes = require("./paymentMethodRoutes");
const paymentRoutes = require("./paymentRoutes");
const mockGatewayRoutes = require("./mockGatewayRoutes");
const PaymentMethodController = require("../controllers/PaymentMethodController");

const router = express.Router();
const paymentMethodController = new PaymentMethodController();

/**
 * Health check endpoint
 * @route GET /
 */
router.get("/", (req, res) => {
  paymentMethodController.healthCheck(req, res);
});

/**
 * Rotas de método de pagamento
 * @route /api/metodo-pagamento
 */
router.use("/api/metodo-pagamento", paymentMethodRoutes);

/**
 * Rotas de pagamentos
 * @route /api/pagamentos
 */
router.use("/api/pagamento", paymentRoutes);

/**
 * Rotas do mock-gateway
 * @route /api/mock-gateway
 */
router.use("/api/mock-gateway", mockGatewayRoutes);

module.exports = router;
