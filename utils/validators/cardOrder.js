
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');
const orderModel = require('../../models/orderModel');
const userModel = require('../../models/userModel')


exports.acceptValidate = [
    check('order')
    .optional()
    .isMongoId()
    .withMessage('Invalid ID formate')
    .custom((ordersIds) =>
      orderModel.find({ _id: { $exists: true, $in: ordersIds } }).then(
        (result) => {
          if (result.length < 1|| result.length === ordersIds.length) {
            return Promise.reject(new Error(`Invalid order Ids`));
          }
        }
      )
    )
    .custom((val, { req }) =>
      orderModel.find({ _id: req.body._id }).then(
        (orders) => {
          const ordersIdes = [];
          // eslint-disable-next-line no-shadow
          orders.forEach((orderModel) => {
            ordersIdes.push(orderModel._id.toString());
          });
        //   console.log(ordersIdes)
          // check if subcategories ids in db include subcategories in req.body (true)
          // eslint-disable-next-line eqeqeq, no-undef
        //   const checker = (target, arr) => target.every((v) => arr.includes(v));
        //   if (!checker(val, ordersIdes)) {
        //     return Promise.reject(
        //       new Error(`cardorder not belong to order`)
        //     );
        //   }
        }
      )
    ),
    check('user')
    .optional()
    .isMongoId()
    .withMessage('Invalid ID formate')
    .custom((userIds) =>
      userModel.find({ _id: { $exists: true, $in: userIds } }).then(
        (result) => {
          if (result.length < 1|| result.length === userIds.length) {
            return Promise.reject(new Error(`Invalid user Ids`));
          }
        }
      )
    ),
    check('accept')
        .notEmpty()
        .withMessage('cardOrder required')
        
    ,
validatorMiddleware,
]