/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')
const archives = require('../models/archive')

exports.createArchive = asyncHandler(async (req, res,next) => {

  if (!req.user.Permission.canCreatArchive) {
    return next(new ApiError('You do not have permission to create an archives', 403));
  }

  const newDoc = await archives.create(req.body);
  if (!newDoc) {
      return next(
        new ApiError(`No document for this id ${req.body}`, 404)
      );
    }

    res.status(201).json({ archives: newDoc });
});

exports.getArchive =  asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwOneArchive) {
    return next(new ApiError('You do not have permission to viw this archives', 403));
  }

  const { id } = req.params;
  const document = await archives.findById(id);
  if (!document) {
     return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ archives: document });
});

exports.getsArchive = asyncHandler(async (req, res,next) => {

  if (!req.user.Permission.canViwsArchive) {
    return next(new ApiError('You do not have permission to viws this archives', 403));
  }

  let filter = {};
  if (req.filterObj) {
    filter = req.filterObj;
  }
  // Build query
  const documentsCounts = await archives.countDocuments();
  const apiFeatures = new ApiFeatures(archives.find(filter), req.query)
    .paginate(documentsCounts)
    .filter()
    .search(archives)
    .limitFields()
    .sort();

  // Execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, archives: documents });
});

exports.deleteArchive =  asyncHandler(async (req, res, next) => {
    
  const { id } = req.params;

  if (!req.user.Permission.canDeletArchive) {
    return next(new ApiError('You do not have permission to delete this archives', 403));
  }

  const document = await archives.findByIdAndDelete(id);

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});

exports.updateArchive =  asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canEidtArchive) {
    return next(new ApiError('You do not have permission to edit this archives', 403));
  }

  const document = await archives.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!document) {
    return next(
      new ApiError(`No document for this id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ archives: document });
});

exports.getArchivesAccept = asyncHandler(async (req, res, next) => {
    try {
      // ابحث في جميع الطلبات المقبولة في حالة الطلب 'accept' أو 'acceptwork' في حالة العمل
      const acceptedOrders = await archives.find({
        $or: [
          { 'State': 'accept' },
          { 'StateWork': 'acceptwork' }
        ]
      });
  
      // قم بإرجاع النتائج
      res.status(200).json({ success: true, data: acceptedOrders });
    } catch (error) {
      console.error('Error in getAcceptedOrdersFromArchive:', error);
      return next(new ApiError(500, 'Internal Server Error'));
    }
});

exports.getArchivesReject =  asyncHandler(async (req, res, next) => {
    try {
      // ابحث في جميع الطلبات المرفوضة في حالة الطلب 'reject' أو 'reject' في حالة العمل
      const rejectedOrders = await archives.find({
        $or: [
          { 'State': 'reject' },
          { 'StateWork': 'reject' }
        ]
      });
  
      // قم بإرجاع النتائج
      res.status(200).json({ success: true, data: rejectedOrders });
    } catch (error) {
      console.error('Error in getRejectedOrdersFromArchive:', error);
      return next(new ApiError(500, 'Internal Server Error'));
    }
});