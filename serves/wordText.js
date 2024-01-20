
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')
const wordText = require('../models/wordText')

exports.createWordText =   asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canCreatWordtext) {
      return next(new ApiError('You do not have permission to create an order', 403));
    }

    const newDoc = await wordText.create(req.body);
    if (!newDoc) {
        return next(
          new ApiError(`No document for this id ${req.body}`, 404)
        );
      }
  
      res.status(201).json({ order: newDoc });
    });

exports.getWordText =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canViwOneWordtext) {
      return next(new ApiError('You do not have permission to viw this text', 403));
    }

    const { id } = req.params;
    const document = await wordText.findById(id);
    if (!document) {
       return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ order: document });
  });

exports.getsWordText = asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canViwsWordtext) {
      return next(new ApiError('You do not have permission to viws this order', 403));
    }

    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await wordText.countDocuments();
    const apiFeatures = new ApiFeatures(wordText.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(wordText)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, order: documents });
  });

exports.deleteWordText =  asyncHandler(async (req, res, next) => {
    
    const { id } = req.params;

    if (!req.user.Permission.canDeletWordtext) {
      return next(new ApiError('You do not have permission to delete this text', 403));
    }

    const document = await wordText.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updateWordText =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canEditWordtext) {
      return next(new ApiError('You do not have permission to edit this text', 403));
    }

    const document = await wordText.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ order: document });
  });
