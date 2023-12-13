// const slugify = require('slugify');
// const bcrypt = require('bcryptjs');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddlewares');
const User = require('../../models/userModel');

exports.createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({ min: 3 })
    .withMessage('Too short User name'),

  check('userId')
    .notEmpty()
    .withMessage('userId required')
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
    .withMessage('Password must be at least 6 characters'),


  check('phone')
    .optional()
    .isMobilePhone(["ar-IQ"])
    .withMessage('Invalid phone number only accepted IQ Phone numbers'),

  check('profileImg').optional(),
  check('role').optional(),

  validatorMiddleware,
];

exports.getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('name')
    .optional(),

  check('userId')
    .notEmpty()
    .withMessage('userId required')
    
    .custom((val) =>
      User.findOne({ userId: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('userId already in user'));
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-IQ'])
    .withMessage('Invalid phone number only accepted IQ Phone numbers'),

  check('profileImg').optional(),
  check('role').optional(),
  validatorMiddleware,
];


exports.deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware,
];

// exports.updateLoggedUserValidator = [
//   body('name')
//     .optional()
//     .custom((val, { req }) => {
//       req.body.slug = slugify(val);
//       return true;
//     }),
//   check('userId')
//     .notEmpty()
//     .withMessage('userId required')
//     .custom((val) =>
//       User.findOne({ email: val }).then((user) => {
//         if (user) {
//           return Promise.reject(new Error('userId already in user'));
//         }
//       })
//     ),
//   check('phone')
//     .optional()
//     .isMobilePhone(['ar-IQ'])
//     .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

//   validatorMiddleware,
// ];