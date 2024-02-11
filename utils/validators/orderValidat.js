
// eslint-disable-next-line import/no-extraneous-dependencies
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');
const Order = require('../../models/orderModel')

exports.getOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Review id format'),
  validatorMiddleware,
];

exports.createOrderValidator = [

  check('caption')
    .optional(),

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
  .withMessage('Invalid category id format'),
  validatorMiddleware,
]