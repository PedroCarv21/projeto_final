const express = require("express");
const { body, param } = require("express-validator");
const PaymentController = require("../controllers/PaymentController");

const router = express.Router();
const paymentController = new PaymentController();

const createPaymentValidation = [
  body("valorTotal")
    .isFloat({ gt: 0 })
    .withMessage("valorTotal deve ser maior que 0"),
  body("idUsuario").isUUID(4).withMessage("idUsuario deve ser UUID v4"),
  body("idReserva").isUUID(4).withMessage("idReserva deve ser UUID v4"),
  body("idMetodoPagamento")
    .isUUID()
    .withMessage("idMetodoPagamento deve ser um UUID v1"),
  body("cartao").optional().isObject(),
  body("cartao.number").optional().isLength({ min: 12, max: 19 }),
  body("cartao.holder").optional().isString().isLength({ min: 2 }),
  body("cartao.expMonth").optional().isInt({ min: 1, max: 12 }),
  body("cartao.expYear").optional().isInt({ min: 2024, max: 2100 }),
  body("cartao.cvv").optional().isLength({ min: 3, max: 4 }),
];

router.post("/", createPaymentValidation, (req, res) => {
  paymentController.createPayment(req, res);
});

router.get("/", (req, res) => {
  paymentController.getAllPayments(req, res);
});

router.get("/:id", [param("id").isUUID(4)], (req, res) => {
  paymentController.getPaymentById(req, res);
});

module.exports = router;
