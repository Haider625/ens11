
// eslint-disable-next-line import/no-extraneous-dependencies
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');


exports.getWordTextValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Review id format'),
  validatorMiddleware,
];

exports.createWordTextValidator = [
  check('name')
  .notEmpty()
  .withMessage('name required')
  .isLength({ min: 1 })
  .withMessage('Too short name')
  .isLength({ max: 250 })
  .withMessage('Too long name'),

  validatorMiddleware,
];

exports.updateWordTextValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Group id format'),
  validatorMiddleware,

];

exports.deleteWordTextValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Group id format'),
  validatorMiddleware,
];

