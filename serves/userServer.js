/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')
const User = require('../models/userModel')
const createToken = require('../utils/creatToken');


const { uploadMixOfImages } = require('../middlewares/uploadImage');

exports.uploadUserImage = uploadMixOfImages([
  {
    name: 'image',
    maxCount: 1,
  },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Image processing for orderimg
  if (req.files && req.files.image) {
    const orderimgFileName = `user-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.files.image[0].path)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${orderimgFileName}`);

    // Save image into our db
    req.body.image = orderimgFileName;
  }
  try {
    await fs.rm('uploads/test', { recursive: true });
    console.log('Contents of "uploads/test" directory deleted successfully.');
  } catch (err) {
    // console.error('Error deleting contents of "uploads/test" directory:', err);
  }
  next()
})

exports.createUser =  asyncHandler(async (req, res,next) => {

  if (!req.user.Permission.canCreatUser) {
    return next(new ApiError('You do not have permission to create an user', 403));
  }

  const newDoc = await User.create(req.body);
  if (!newDoc) {
      return next(
        new ApiError(`No document for this id ${req.body}`, 404)
      );
    }

    res.status(201).json({ user: newDoc });
  });

exports.getUser =asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwOneUser) {
    return next(new ApiError('You do not have permission to viw this User', 403));
  }

  const { id } = req.params;
  const document = await User.findById(id);
  if (!document) {
     return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ user: document });
});

exports.getsUser = asyncHandler(async (req, res,next) => {

  if (!req.user.Permission.canViwsUser) {
    return next(new ApiError('You do not have permission to viws this User', 403));
  }

  let filter = {};
  if (req.filterObj) {
    filter = req.filterObj;
  }
  // Build query
  const documentsCounts = await User.countDocuments();
  const apiFeatures = new ApiFeatures(User.find(filter), req.query)
    .paginate(documentsCounts)
    .search('User')
    .limitFields()
    .sort();
  

  // Execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, user: documents });
});

exports.deleteUser =  asyncHandler(async (req, res, next) => {
    
  const { id } = req.params;

  if (!req.user.Permission.canDeletUser) {
    return next(new ApiError('You do not have permission to delete this User', 403));
  }

  const document = await User.findByIdAndDelete(id);

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});

exports.updateUser =  asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canEidtUser) {
    return next(new ApiError('You do not have permission to edit this User', 403));
  }

  const document = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!document) {
    return next(
      new ApiError(`No document for this id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ user: document });
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  
  if (!req.user.Permission.updateLoggedUserPassword) {
    return next(new ApiError('You do not have permission to delete this order', 403));
  }
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
      UserChangerPassword : req.user._id
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.changeUserPassword) {
    return next(new ApiError('You do not have permission to delete this order', 403));
  }

  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
      UserChangerPassword : req.user._id
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});
