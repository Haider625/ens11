
// eslint-disable-next-line import/no-extraneous-dependencies
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');
const Order = require('../../models/orderModel')

exports.getOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Review id format')
  .custom((val, { req }) =>
    // Check review ownership before update
    Order.findById(val).then((order) => {
      if (!order) {
        return Promise.reject(new Error(`There is no Order with id ${val}`));
      }

      if (order.user._id.toString() !== req.user._id.toString()) {
        return Promise.reject(
          new Error(`Your are not allowed to perform this action`)
        );
      }
    })
  ),
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
  check('title')
  .notEmpty()
  .withMessage('titly required')
  ,
  check('State')
  .optional()
  .default('accept')
  .custom((val, { req }) => {
    req.body.State = "accept";
    if (val !== req.body.State ){
      throw new Error('State most be equil accept');
    }
    return true;
  })
,
  validatorMiddleware,

];

exports.deleteOrderValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid category id format'),
  validatorMiddleware,
];

