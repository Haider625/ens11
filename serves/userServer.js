/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')
const User = require('../models/userModel')
const { uploadSingleImage } = require('../middlewares/uploadImage');

exports.uploadUserImage = uploadSingleImage('image');


exports.resizeImage = asyncHandler(async (req, res, next) => {

  if (!req.file) {
    return next(new ApiError({ message: 'No file uploaded', statusCode: 400 }));
  }

  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  // استخدم Promise لضمان اكتمال عملية toFile قبل استدعاء next()
  await new Promise((resolve, reject) => {
    sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`uploads/users/${filename}`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });

  req.body.image = filename;
  next();
});

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
    .filter()
    .search(User)
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


