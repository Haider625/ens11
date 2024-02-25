
// eslint-disable-next-line import/no-extraneous-dependencies
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');

exports.getOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Order id format'),
  validatorMiddleware,
];

exports.createOrderValidator = [

  check('type1')
  .notEmpty()
  .withMessage('type1 required'),
  check('type2')
  .notEmpty()
  .withMessage('type2 required'),
  check('type3')
  .notEmpty()
  .withMessage('type3 required'),
  check('number')
  .isLength({ max: 10 })
  .withMessage('Too long number')
  .default(1),
  check('caption')
  .isLength({ max: 310 })
  .withMessage('Too long caption')
  ,

  validatorMiddleware,
];

exports.updateOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Order id format')
,
  validatorMiddleware,

];

exports.deleteOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Order id format'),
  validatorMiddleware,
]