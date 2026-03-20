const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validate, wishlistValidations } = require('../middleware/validationMiddleware');
const {
  createWishlist,
  getWishlists,
  updateWishlist,
  deleteWishlist,
  getProgress,
  getSummary
} = require('../controllers/wishlistController');

router.use(protect);

router.get('/summary', getSummary);
router.get('/', getWishlists);
router.post('/', validate(wishlistValidations.create), createWishlist);
router.get('/:id/progress', getProgress);
router.put('/:id', validate(wishlistValidations.update), updateWishlist);
router.delete('/:id', deleteWishlist);

module.exports = router;