const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validate, transactionValidations } = require('../middleware/validationMiddleware');
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyChart
} = require('../controllers/transactionController');

router.use(protect);

router.get('/summary', getSummary);
router.get('/chart', getMonthlyChart);
router.get('/', getTransactions);
router.post('/', validate(transactionValidations.create), createTransaction);
router.put('/:id', validate(transactionValidations.update), updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;