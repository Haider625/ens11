/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')

const JobTitle = require('../models/JobTitle');

exports.createJobTitle=   asyncHandler(async (req, res,next) => {

    if (!req.user.Permission.canCreatJobTitle) {
      return next(new ApiError('You do not have permission to create an JobTitle', 403));
    }

    const newDoc = await JobTitle.create(req.body);
    if (!newDoc) {
        return next(
          new ApiError(`No document for this id ${req.body}`, 404)
        );
      }
  
      res.status(201).json({ JobTitle: newDoc });
    });

exports.getJobTitle =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canViwOneJobTitle) {
      return next(new ApiError('You do not have permission to viw this JobTitle', 403));
    }

    const { id } = req.params;
    const document = await JobTitle.findById(id);
    if (!document) {
       return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ JobTitle: document });
  });

  exports.getsJobTitle = asyncHandler(async (req, res, next) => {
    if (!req.user.Permission.canViwsJobTitle) {
        return next(new ApiError('You do not have permission to view this JobTitle', 403));
    }
      if (req.filter) {
        filter = req.filter;
      }
    
      const documentsCounts = await JobTitle.countDocuments();
      const apiFeatures = new ApiFeatures(
        JobTitle.find({filter }), 
        req.query
      )
        .paginate(documentsCounts)
        .sort()
        .search('JobTitle')
        .limitFields()
      const { mongooseQuery, paginationResult } =  apiFeatures;
    
      const documents = await mongooseQuery;
      res
        .status(200)
        .json({ 
          results: documents.length,
           paginationResult ,
           wordText: documents 
          });
});

exports.deleteJobTitle =  asyncHandler(async (req, res, next) => {
    
    const { id } = req.params;

    if (!req.user.Permission.canDeletJobTitle) {
      return next(new ApiError('You do not have permission to delete this JobTitle', 403));
    }

    const document = await JobTitle.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updateJobTitle =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canEditWordtext) {
      return next(new ApiError('You do not have permission to edit this JobTitle', 403));
    }

    const document = await JobTitle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ JobTitle: document });
  });