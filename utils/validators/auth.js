const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');
const User = require('../../models/userModel');

exports.signupValidator = [
  check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('userId')
    .notEmpty()
    .withMessage('Email required')
    .custom((val) =>
      User.findOne({ userId : val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

exports.loginValidator = [
  check('userId')
    .notEmpty()
    .withMessage('Email required'),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  validatorMiddleware,
];