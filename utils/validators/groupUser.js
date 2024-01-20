
// eslint-disable-next-line import/no-extraneous-dependencies
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');


exports.getGroupValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Review id format'),
  validatorMiddleware,
];

exports.createGroupValidator = [
  check('name')
  .notEmpty()
  .withMessage('name required')
  .isLength({ min: 3 })
  .withMessage('Too short name')
  .isLength({ max: 32 })
  .withMessage('Too long name'),

  check('level')
    .optional(),
 

  validatorMiddleware,
];

exports.updateGroupValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Group id format'),
  validatorMiddleware,

];

exports.deleteGroupValidator = [
  check('id')
  .isMongoId()
  .withMessage('Invalid Group id format'),
  validatorMiddleware,
];

