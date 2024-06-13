/* eslint-disable prefer-destructuring */

const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const ApiFeatures = require('../utils/apiFeatures');
const ApiError = require('../utils/apiError');
const TypeText1 = require('../models/typeText1');
const TypeText2 = require('../models/typeText2');
const typeText3 = require('../models/typeText3')

const {
  groupFilter,
  groupsFilter,
  OrdersFilter,
  OnpraseOrdersFilter,
  rejectsOrderFilter,
  createApiFeatures,
  ArchiveOrderFilter
} = require('../middlewares/filtergetOrders')

exports.getOrders = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwsOrder) {
    return next(new ApiError('You do not have permission to view this order', 403));
  }

  const loggedInUserId = req.user._id;
  let filter = {};
  if (req.filter) {filter = req.filter;}

  const groupOrderFilters = await groupFilter(loggedInUserId);

  const groupOnpraseFilters = await groupsFilter(loggedInUserId);

  const OrdersFilters = await OrdersFilter(loggedInUserId);

  const OnpraseOrdersFilters = await OnpraseOrdersFilter(loggedInUserId)

  const rejectsOrderFilters = await rejectsOrderFilter(loggedInUserId,req)

  const documentsCounts = await Order.countDocuments();

  const orderQuery = Order.find({
    $and: [
      { $or: [{ ...groupOrderFilters }, { users: loggedInUserId }] },
      {
        $and: [
          { ...OrdersFilters },
          // { StateWork: { $ne: 'confirmWork' } },
          // { StateWork: { $ne: 'endwork' } }
        ],
        ...filter
      }
    ]
  });  
 
  const apiFeatures =await createApiFeatures(orderQuery, req.query, documentsCounts);
  const { mongooseQuery, paginationResult } = apiFeatures;

  const documents = await mongooseQuery;

  const countOnepreasApiFeatures = new ApiFeatures(Order.find({$or: [{ ... groupOnpraseFilters  }, { usersOnprase: loggedInUserId }],$and :[{...OnpraseOrdersFilters}], ...filter}), req.query)

  const { mongooseQuery: countOnepreasMongooseQuery } =  countOnepreasApiFeatures;
  const countOnepreas = await countOnepreasMongooseQuery;
  const filters = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], group: req.user.group };

  const countRejectApiFeatures = new ApiFeatures(Order.find({$or: [{ ...groupOnpraseFilters }, { usersOnprase: loggedInUserId }],$and :[{...rejectsOrderFilters}], ...filters}), req.query)
  const { mongooseQuery: countRejectMongooseQuery } =  countRejectApiFeatures;
  const countReject = await countRejectMongooseQuery;
  res
    .status(200)
    .json({ 
      results: documents.length,
       paginationResult ,
       CountOnpreas:countOnepreas .length, 
       countReject : countReject.length,
       orders: documents 
      });
});

exports.getOnpraseOrders = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwsOrder) {
    return next(new ApiError('You do not have permission to view this order', 403));
  }

  const loggedInUserId = req.user._id;
  let filter = {};
  if (req.filter) {
    filter = req.filter;
  }

  const groupFilters = await groupsFilter(loggedInUserId);

  const acceptedOrdersFilters = await OnpraseOrdersFilter(loggedInUserId)

  const documentsCounts = await Order.countDocuments();
  const orderQuery = Order.find({
    $and: [
      { $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }] },
      { $and: [{ ...acceptedOrdersFilters },{ ...filter }] }
    ]
  });

  const apiFeatures =await createApiFeatures(orderQuery, req.query, documentsCounts);
 
  const { mongooseQuery, paginationResult } = await apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, order: documents });

});

exports.getAllRejected = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  const groupFilters = await groupsFilter(loggedInUserId);
  const acceptedOrdersFilters = await rejectsOrderFilter(loggedInUserId,req)
  // const filter = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], group: req.user.group };

    const documentsCounts = await Order.countDocuments();

    const orderQuery = Order.find({
      $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }],
      $and :[{...acceptedOrdersFilters}],})

     const apiFeatures =await createApiFeatures(orderQuery, req.query, documentsCounts);
 
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, order: documents });

  });

exports.getsArchive = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwsOrder) {
    return next(new ApiError('You do not have permission to view this order', 403));
  }

  const loggedInUserId = req.user._id;
  let filter = {};
  if (req.filter) {
    filter = req.filter;
  }

  const groupOrderFilters = await groupFilter(loggedInUserId);

  const groupOnpraseFilters = await groupsFilter(loggedInUserId);

  const archiveFilter = await ArchiveOrderFilter(loggedInUserId)

  const documentsCounts = await Order.countDocuments();
   const orderQuery = Order.find({
    $and: [
      { $or: [{ ...groupOrderFilters },{ ...groupOnpraseFilters }, { usersOnprase: loggedInUserId },{ users: loggedInUserId }] },
      { $and: [{ ...archiveFilter }, { ...filter }] }
    ]
  })
  
  const apiFeatures = await createApiFeatures(orderQuery, req.query, documentsCounts);

  const { mongooseQuery, paginationResult } = await apiFeatures;

  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, order: documents });
});

exports.getAllText = asyncHandler(async (req, res, next) => {
  try {

    const typeText1Data = await TypeText1.find({})

 
    const typeText2Data = await TypeText2.find({})


    const typeText3Data = await typeText3.find({})

 
    res.status(200).json({ typeText1Data, typeText2Data, typeText3Data });
  } catch (error) {
    next(new ApiError(`Error fetching data: ${error.message}`, 500));
  }
});

exports.deleteAll = asyncHandler(async (req,res,next) => {

  if (!req.user.Permission.canDeletOrder) {
    return next(new ApiError('You do not have permission to delete this order', 403));
  }

  const document = await Order.deleteMany({});

  if (!document) {
    return next(new ApiError(``, 404));
  }
  res.status(204).send();
});

exports.getAllOrder = asyncHandler(async(req,res,next) => {

    //   const queryStringObj = { ...req.query };
    //   const excludesFields = ['page', 'sort', 'limit', 'fields'];
    //   excludesFields.forEach((field) => delete queryStringObj[field]);
    //   // Apply filtration using [gte, gt, lte, lt]
    //    let queryStr = JSON.stringify(queryStringObj);

    //   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //   console.log(JSON.parse(queryStr)) 
  const documents = await Order.find();

  // if (!documents || documents.length === 0) {

    // return res.status(204).json({ message: 'No documents found.' });
  // }

  res.status(200).json({ results : documents.length, documents: documents });
})
 