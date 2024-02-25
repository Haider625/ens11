
// eslint-disable-next-line import/no-extraneous-dependencies
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');


exports.getTypeText1Validator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Review id format'),
  validatorMiddleware,
];

exports.createTypeText1Validator = [
  check('name')
  .notEmpty()
  .withMessage('name required')
  .isLength({ min: 1 })
  .withMessage('Too short name')
  .isLength({ max: 150 })
  .withMessage('Too long name'),

  validatorMiddleware,
];

exports.updateTypeText1Validator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Group id format'),
  validatorMiddleware,

];

exports.deleteTypeText1Validator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Group id format'),
  validatorMiddleware,
];

