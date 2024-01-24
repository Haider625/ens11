/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */

const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/creatToken');

const User = require('../models/userModel');
// @desc    Signup
// @route   GET /api/v1/auth/signup
// @access  Public
exports.singup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await User.create(req.body);

  // 2- Generate token
  const token = createToken(user._id);

  if (!user) {
    return next(new ApiError('Failed to create user', 500));
  }

  // 3- Check if image field is present in the request body
  if (req.file) {
    // Assuming that the Multer middleware has named the file field as 'image'
    user.image = req.file.filename;
    await user.save();
  }

  res.status(201).json({ user : user, token });
});


// @desc    Login
// @route   GET /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1) check if password and email in the body (validation)
  // 2) check if user exists & check if the password is correct
  const user = await User.findOne({ userId: req.body.userId });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect userId or password', 401));
  }

  // 3) Check if the user is active
  if (!user.active) {
    return next(new ApiError('User is not active', 403));
  }

  // 4) generate token
  const token = createToken(user._id);

  // Delete password from the response
  delete user._doc.password;

  // 5) send response to the client side
  res.status(200).json({ user: user, token });
});

// @desc    Logout
// @route   GET /api/v1/auth/logout
// @access  Private (since you're logging out a logged-in user)
exports.logout = asyncHandler(async (req, res, next) => {
  // إلغاء صلاحية رمز JWT
  res.clearCookie('jwt'); // افتراضياً، يتم تخزين رمز JWT في ملف تعريف الارتباط

  res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
});



// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    // تحقق من وجود رمز JWT في ملف تعريف الارتباط
    token = req.cookies.jwt;
  }
  
  if (!token) {
    return next(
      new ApiError(
        'You are not login, Please login to get access this route',
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        'The user that belong to this token does no longer exist',
        401
      )
    );
  }

  // // 4) Check if user change his password after token created
  // if (currentUser.passwordChangedAt) {
  //   const passChangedTimestamp = parseInt(
  //     currentUser.passwordChangedAt.getTime() / 1000,
  //     10
  //   );
  //   // Password changed after token created (Error)
  //   if (passChangedTimestamp > decoded.iat) {
  //     return next(
  //       new ApiError(
  //         'User recently changed his password. please login again..',
  //         401
  //       )
  //     );
  //   }
  // }

  req.user = currentUser;
  next();
});

// @desc    Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      );
    }
    next();
  });
