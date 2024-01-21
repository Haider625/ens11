
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')
const typeText3 = require('../models/typeText3')

exports.createtypeText3 =   asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canCreattypeText3) {
      return next(new ApiError('You do not have permission to create an typeText3', 403));
    }

    const newDoc = await typeText3.create(req.body);
    if (!newDoc) {
        return next(
          new ApiError(`No document for this id ${req.body}`, 404)
        );
      }
  
      res.status(201).json({ typeText3: newDoc });
    });

exports.gettypeText3 =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canViwOnetypeText3) {
      return next(new ApiError('You do not have permission to viw this typeText3', 403));
    }

    const { id } = req.params;
    const document = await typeText3.findById(id);
    if (!document) {
       return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ typeText3: document });
  });

exports.getstypeText3 = asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canViwstypeText3) {
      return next(new ApiError('You do not have permission to viws this typeText3', 403));
    }

    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await typeText3.countDocuments();
    const apiFeatures = new ApiFeatures(typeText3.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(typeText3)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, typeText3: documents });
  });

exports.deletetypeText3 =  asyncHandler(async (req, res, next) => {
    
    const { id } = req.params;

    if (!req.user.Permission.canDelettypeText3) {
      return next(new ApiError('You do not have permission to delete this typeText3', 403));
    }

    const document = await typeText3.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updatetypeText3 =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canEdittypeText3) {
      return next(new ApiError('You do not have permission to edit this typeText3', 403));
    }

    const document = await typeText3.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ typeText3: document });
  });
