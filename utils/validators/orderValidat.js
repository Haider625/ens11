
// eslint-disable-next-line import/no-extraneous-dependencies
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');

exports.getOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid category id format'),
  validatorMiddleware,
];

exports.createOrderValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category required')
    .isLength({ min: 3 })
    .withMessage('Too short category name')
    .isLength({ max: 32 })
    .withMessage('Too long category name'),

  validatorMiddleware,
];

exports.updateOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Order id format'),
  body('name')
  .optional(),
  validatorMiddleware,
];

exports.deleteOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid category id format'),
  validatorMiddleware,
];