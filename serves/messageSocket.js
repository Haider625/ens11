/* eslint-disable import/no-extraneous-dependencies */

const asyncHandler = require('express-async-handler');
const cron = require('node-cron');
const moment = require('moment-timezone');
const ApiError = require('../utils/apiError')
const ApiFeatures = require('../utils/apiFeatures')
const messageSocket = require('../models/messageSocket')
const {getFormattedDate} = require('../config/moment')

exports.createMessageSocket=   asyncHandler(async (req, res,next) => {

    const newDoc = await messageSocket.create(req.body);
    if (!newDoc) {
        return next(
          new ApiError(`No document for this id ${req.body}`, 404)
        );
      }
  
      res.status(201).json({ messageSocket: newDoc });
    });

exports.getMessageSocket =   asyncHandler(async (req, res, next) => {

    const { id } = req.params;
    const document = await messageSocket.findById(id);
    if (!document) {
       return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ messageSocket: document });
  });

exports.getsMessageSocket = asyncHandler(async (req, res,next) => {

    const loggedInUserId = req.user._id;
    const loggedInUserGroup = req.user.group
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    const {userId} = loggedInUserId
    const group = loggedInUserGroup.name

    // Build query
    const documentsCounts = await messageSocket.countDocuments();
    const apiFeatures = new ApiFeatures(messageSocket.find( { $or: [{ room: userId }, { room: group }] }), req.query)
      .paginate(documentsCounts)
      .search('messageSocket')
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, messageSocket: documents });
  });

exports.deleteMessageSocket =  asyncHandler(async (req, res, next) => {
    
    const { id } = req.params;

    if (!req.user.Permission.canDeletMessageSocket) {
      return next(new ApiError('You do not have permission to delete this MessageSocket', 403));
    }

    const document = await messageSocket.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(204).send();
  });

exports.updateMessageSocket =   asyncHandler(async (req, res, next) => {

    if (!req.user.Permission.canEditMessageSocket) {
      return next(new ApiError('You do not have permission to edit this MessageSocket', 403));
    }

    const document = await messageSocket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }

    res.status(200).json({ messageSocket: document });
  });

  exports.cronTask = asyncHandler(async () => {
    // حساب التاريخ الذي يعود إلى شهر واحد مضى
    
    const oneMonthAgo = moment().subtract(1, 'months').toDate();

    console.log(oneMonthAgo)

    try {
        // البحث عن البيانات التي تمر على وجودها لأكثر من شهر
        const outdatedData = await messageSocket.deleteMany({ createdAt: { $lte: oneMonthAgo } });
        console.log(`تم حذف ${outdatedData.deletedCount} بيانات من النموذج`);
    } catch (error) {
        console.error('حدث خطأ أثناء حذف البيانات:', error);
    }
});
