const express = require('express');
const PaymentMethodController = require('../controllers/PaymentMethodController');

const router = express.Router();
const paymentMethodController = new PaymentMethodController();

/**
 * @route GET /metodo-pagamento
 * @description Retorna todos os métodos de pagamento ativos
 * @access Public
 */
router.get('/', (req, res) => {
  paymentMethodController.getAllPaymentMethods(req, res);
});

/**
 * @route GET /metodo-pagamento/tipo/:tipo
 * @description Retorna um método de pagamento pelo tipo (1 = Cartão, 2 = PIX)
 * @access Public
 */
router.get('/tipo/:tipo', (req, res) => {
  paymentMethodController.getPaymentMethodByTipo(req, res);
});

/**
 * @route GET /metodo-pagamento/:id
 * @description Retorna um método de pagamento pelo ID
 * @access Public
 */
router.get('/:id', (req, res) => {
  paymentMethodController.getPaymentMethodById(req, res);
});

module.exports = router;