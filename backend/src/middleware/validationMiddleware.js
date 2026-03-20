const { body, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  };
};

const authValidations = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Nama harus diisi')
      .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter')
      .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email harus diisi')
      .isEmail().withMessage('Email tidak valid')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password harus diisi')
      .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email harus diisi')
      .isEmail().withMessage('Email tidak valid')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password harus diisi')
  ]
};

const transactionValidations = {
  create: [
    body('type')
      .notEmpty().withMessage('Tipe transaksi harus diisi')
      .isIn(['pemasukan', 'pengeluaran']).withMessage('Tipe transaksi tidak valid'),
    body('amount')
      .notEmpty().withMessage('Nominal harus diisi')
      .isInt({ min: 1 }).withMessage('Nominal harus lebih dari 0'),
    body('description')
      .trim()
      .notEmpty().withMessage('Keterangan harus diisi')
      .isLength({ max: 500 }).withMessage('Keterangan maksimal 500 karakter'),
    body('transactionDate')
      .notEmpty().withMessage('Tanggal harus diisi')
      .isISO8601().withMessage('Format tanggal tidak valid')
  ],
  update: [
    body('amount')
      .optional()
      .isInt({ min: 1 }).withMessage('Nominal harus lebih dari 0'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Keterangan maksimal 500 karakter'),
    body('transactionDate')
      .optional()
      .isISO8601().withMessage('Format tanggal tidak valid')
  ]
};

const wishlistValidations = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Nama wishlist harus diisi')
      .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter'),
    body('targetAmount')
      .notEmpty().withMessage('Target nominal harus diisi')
      .isInt({ min: 1 }).withMessage('Target nominal harus lebih dari 0'),
    body('savedAmount')
      .optional()
      .isInt({ min: 0 }).withMessage('Nominal terkumpul tidak boleh negatif')
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter'),
    body('targetAmount')
      .optional()
      .isInt({ min: 1 }).withMessage('Target nominal harus lebih dari 0'),
    body('savedAmount')
      .optional()
      .isInt({ min: 0 }).withMessage('Nominal terkumpul tidak boleh negatif')
  ]
};

module.exports = {
  validate,
  authValidations,
  transactionValidations,
  wishlistValidations
};