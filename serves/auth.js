/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */

const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
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
exports.logout = asyncHandler(async(req, res) => {
  try {
    // إلغاء صلاحية رمز JWT عن طريق إعادة توقيعه بقيمة فارغة ووقت انتهاء صلاحيته فوراً
    const invalidatedToken = createToken('');

    res.cookie('jwt', invalidatedToken, {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    // تعامل مع الأخطاء هنا
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'حدثت مشكلة أثناء تسجيل الخروج' });
  }
}
)



// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists
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
        'You are not logged in, Please log in to get access to this route',
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3) Check if user exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(
        new ApiError(
          'The user that belongs to this token no longer exists',
          401
        )
      );
    }

    // 4) Set user information on the request object
    req.user = currentUser;
    next();
  } catch (err) {
    // Handle token verification failure (expired or invalid token)
    return next(
      new ApiError('Invalid token or token has expired, please log in', 401)
    );
  }
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
