const express = require("express");
const MockGatewayController = require("../controllers/MockGatewayController");
const { body } = require("express-validator");

const router = express.Router();
const controller = new MockGatewayController();

router.post(
  "/charge",
  [
    body("idPagamento").isUUID(4),
    body("amount").isFloat({ gt: 0 }),
    body("cardToken").isString().isLength({ min: 10 }),
  ],
  (req, res) => controller.charge(req, res)
);

router.post(
  "/pix",
  [body("idPagamento").isUUID(4), body("amount").isFloat({ gt: 0 })],
  (req, res) => controller.pix(req, res)
);

module.exports = router;
