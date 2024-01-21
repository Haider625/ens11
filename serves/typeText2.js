
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')
const typeText2 = require('../models/typeText2')

exports.createtypeText2 =   asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canCreattypeText2) {
      return next(new ApiError('You do not have permission to create an typeText2', 403));
    }

    const newDoc = await typeText2.create(req.body);
    if (!newDoc) {
        return next(
          new ApiError(`No document for this id ${req.body}`, 404)
        );
      }
  
      res.status(201).json({ typeText2: newDoc });
    });

exports.gettypeText2 =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canViwOnetypeText2) {
      return next(new ApiError('You do not have permission to viw this typeText2', 403));
    }

    const { id } = req.params;
    const document = await typeText2.findById(id);
    if (!document) {
       return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ typeText2: document });
  });

exports.getstypeText2 = asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canViwstypeText2) {
      return next(new ApiError('You do not have permission to viws this typeText2', 403));
    }

    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await typeText2.countDocuments();
    const apiFeatures = new ApiFeatures(typeText2.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(typeText2)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, typeText2: documents });
  });

exports.deletetypeText2 =  asyncHandler(async (req, res, next) => {
    
    const { id } = req.params;

    if (!req.user.Permission.canDeletWordtext) {
      return next(new ApiError('You do not have permission to delete this typeText2', 403));
    }

    const document = await typeText2.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updatetypeText2 =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canEdittypeText2) {
      return next(new ApiError('You do not have permission to edit this typeText2', 403));
    }

    const document = await typeText2.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ typeText2: document });
  });
