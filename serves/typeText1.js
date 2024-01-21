
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')
const typeText1 = require('../models/typeText1')

exports.createtypeText1=   asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canCreattypeText1) {
      return next(new ApiError('You do not have permission to create an typeText1', 403));
    }

    const newDoc = await typeText1.create(req.body);
    if (!newDoc) {
        return next(
          new ApiError(`No document for this id ${req.body}`, 404)
        );
      }
  
      res.status(201).json({ typeText1: newDoc });
    });

exports.gettypeText1 =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canViwOnetypeText1) {
      return next(new ApiError('You do not have permission to viw this typeText1', 403));
    }

    const { id } = req.params;
    const document = await typeText1.findById(id);
    if (!document) {
       return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ typeText1: document });
  });

exports.getstypeText1 = asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canViwstypeText1) {
      return next(new ApiError('You do not have permission to viws this typeText1', 403));
    }

    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await typeText1.countDocuments();
    const apiFeatures = new ApiFeatures(typeText1.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(typeText1)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, typeText1: documents });
  });

exports.deletetypeText1 =  asyncHandler(async (req, res, next) => {
    
    const { id } = req.params;

    if (!req.user.Permission.canDelettypeText1) {
      return next(new ApiError('You do not have permission to delete this typeText1', 403));
    }

    const document = await typeText1.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updatetypeText1 =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canEdittypeText1) {
      return next(new ApiError('You do not have permission to edit this typeText1', 403));
    }

    const document = await typeText1.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ typeText1: document });
  });
