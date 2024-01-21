
// eslint-disable-next-line import/no-extraneous-dependencies
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');


exports.getTypeText3Validator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Review id format'),
  validatorMiddleware,
];

exports.createTypeText3Validator = [
  check('name')
  .notEmpty()
  .withMessage('name required')
  .isLength({ min: 5 })
  .withMessage('Too short name')
  .isLength({ max: 100 })
  .withMessage('Too long name'),

  validatorMiddleware,
];

exports.updateTypeText3Validator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Group id format'),
  validatorMiddleware,

];

exports.deleteTypeText3Validator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Group id format'),
  validatorMiddleware,
];

