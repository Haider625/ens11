const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');
const User = require('../../models/userModel');

exports.singupValidator  = [
  check('name')
    .notEmpty()
    .withMessage('name required')
    .isLength({ min: 3 })
    .withMessage('Too short name')
    .isLength({ max: 32 })
    .withMessage('Too long name'),

  check('userId')
    .notEmpty()
    .withMessage('userId required')
    .isLength({ min: 3 })
    .withMessage('Too short userId')
    .isLength({ max: 16 })
    .withMessage('Too long userId')
    .custom((val) =>
      User.findOne({ userId : val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('userId already in user'));
        }
      })
    ),

    check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .isLength({ max: 16 })
    .withMessage('Too long password')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation required'),

  check('jobTitle')
    .notEmpty()
    .withMessage('jobTitle required')
    .isLength({ min: 6 })
    .withMessage('jobTitle must be at least 6 characters')
    .isLength({ max: 32 })
    .withMessage('Too long jobTitle'),

  check('school')
    .notEmpty()
    .withMessage('school required')
    .isLength({ min: 6 })
    .withMessage('school must be at least 6 characters')
    .isLength({ max: 32 })
    .withMessage('Too long school'),

  check('phone')
    .optional()
    .isMobilePhone(["ar-IQ"])
    .withMessage('Invalid phone number only accepted IQ Phone numbers'),

  check('image')
  .optional(),

  check('levelSend')
  .optional(),

  check('levelsReceive')
  .optional(),

  check('forwordLevels')
  .optional(),

  check('role')
  .optional(),

  validatorMiddleware,
];

exports.loginValidator = [
  check('userId')
  .notEmpty()
  .withMessage('userId required')
  .isLength({ min: 3 })
  .withMessage('Too short userId')
  .isLength({ max: 16 })
  .withMessage('Too long userId'),

check('password')
  .notEmpty()
  .withMessage('Password required')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters')
  .isLength({ max: 16 })
  .withMessage('Too long Password'),


  validatorMiddleware,
];