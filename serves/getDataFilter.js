/* eslint-disable prefer-destructuring */

const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');

const ApiError = require('../utils/apiError');

const {
    groupFilter ,
    groupsFilter,
    OrdersFilter,
    OnpraseOrdersFilter,
    rejectsOrderFilter,
    ArchiveOrderFilter,

    } =  require('../middlewares/filtergetOrders')


exports.dataFilterOrderCreater = asyncHandler(async (req, res, next) => {
    try {
        const loggedInUserId = req.user._id;
    
        const groupFilters = await groupFilter(loggedInUserId);
        
        const acceptedOrdersFilter = await OrdersFilter(loggedInUserId);


        const orders = await Order.find({
            $and: [
                { $or: [{ ...groupFilters }, { users: loggedInUserId }] },
                {
                    $and: [
                        { ...acceptedOrdersFilter },
                        // { StateWork: { $ne: 'confirmWork' } },
                        // { StateWork: { $ne: 'endwork' } },
                    ],
                    ...req.filter
                }
            ]
        });

        const countMap = new Map();

        orders.forEach(order => {
            const type1Value = order.createdBy.name;
            if (countMap.has(type1Value)) {
                countMap.set(type1Value, countMap.get(type1Value) + 1);
            } else {
                countMap.set(type1Value, 1);
            }
        });

        const result = {};
        countMap.forEach((value, key) => {
            result[key] = value;
        });

        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(`Error filtering orders: ${error.message}`, 500));
    }
});

exports.dataFilterOnpraseCreater = asyncHandler(async (req,res,next) => {
    try {
        const loggedInUserId = req.user._id;
      let filter = {};
      if (req.filter) {
      filter = req.filter;
      }
        const groupFilters = await groupsFilter(loggedInUserId);
        
        const acceptedOrdersFilter = await OnpraseOrdersFilter(loggedInUserId);


    const orders = await Order.find({
      $and: [
      { $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }] },
      { $and: [{ ...acceptedOrdersFilter },{ ...filter }] }
    ]
  });

        const countMap = new Map();

        orders.forEach(order => {
            const type1Value = order.createdBy.name;
            if (countMap.has(type1Value)) {
                countMap.set(type1Value, countMap.get(type1Value) + 1);
            } else {
                countMap.set(type1Value, 1);
            }
        });

        const result = {};
        countMap.forEach((value, key) => {
            result[key] = value;
        });

        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(`Error filtering orders: ${error.message}`, 500));
    }
})

exports.dataFilterRejectCreater=  asyncHandler(async (req,res,next) => {
try {
        const loggedInUserId = req.user._id;

        const groupFilters = await  groupsFilter(loggedInUserId);
        
        const acceptedOrdersFilter = await rejectsOrderFilter(loggedInUserId,req);
        
        const filter = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], group: req.user.group };


        const orders = await Order.find({
        $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }],
        $and :[{...acceptedOrdersFilter}], ...filter})

        const countMap = new Map();

        orders.forEach(order => {
            const type1Value = order.createdBy.name;
            if (countMap.has(type1Value)) {
                countMap.set(type1Value, countMap.get(type1Value) + 1);
            } else {
                countMap.set(type1Value, 1);
            }
        });

        const result = {};
        countMap.forEach((value, key) => {
            result[key] = value;
        });

        res.status(200).json(result);
    } 
    catch (error)
    {
        next(new ApiError(`Error filtering orders: ${error.message}`, 500));
    }
})

exports.dataFilterArchiveCreater =  asyncHandler(async (req,res,next) => {
try {
        const loggedInUserId = req.user._id;

  
  const groupOrderFilters = await groupFilter(loggedInUserId);

  const groupOnpraseFilters = await groupsFilter(loggedInUserId);
        const acceptedOrdersFilter = await ArchiveOrderFilter(loggedInUserId);

        const orders = await Order.find({
       $and: [
      { $or: [{ ...groupOrderFilters },{ ...groupOnpraseFilters }, { usersOnprase: loggedInUserId },{ users: loggedInUserId }] },
      { $and: [{ ...acceptedOrdersFilter }] }
    ]})

        const countMap = new Map();

        orders.forEach(order => {
            const type1Value = order.createdBy.name;
            if (countMap.has(type1Value)) {
                countMap.set(type1Value, countMap.get(type1Value) + 1);
            } else {
                countMap.set(type1Value, 1);
            }
        });

        const result = {};
        countMap.forEach((value, key) => {
            result[key] = value;
        });

        res.status(200).json(result);
    } 
    catch (error)
    {
        next(new ApiError(`Error filtering orders: ${error.message}`, 500));
    }
})

exports.dataFilterOrderSender = asyncHandler(async (req, res, next) => {
    try {
        const loggedInUserId = req.user._id;
    
        const groupFilters = await groupFilter(loggedInUserId);
        
        const acceptedOrdersFilter = await OrdersFilter(loggedInUserId);


        const orders = await Order.find({
            $and: [
                { $or: [{ ...groupFilters }, { users: loggedInUserId }] },
                {
                    $and: [
                        { ...acceptedOrdersFilter },
                        { StateWork: { $ne: 'confirmWork' } },
                        { StateWork: { $ne: 'endwork' } },
                    ],
                    ...req.filter
                }
            ]
        });

        const countMap = new Map();

        orders.forEach(order => {
            const type1Value = order.senderOrder;
            if (countMap.has(type1Value)) {
                countMap.set(type1Value, countMap.get(type1Value) + 1);
            } else {
                countMap.set(type1Value, 1);
            }
        });

        const result = {};
        countMap.forEach((value, key) => {
            result[key] = value;
        });

        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(`Error filtering orders: ${error.message}`, 500));
    }
});

exports.dataFilterOnpraseSender = asyncHandler(async (req,res,next) => {
    try {
        const loggedInUserId = req.user._id;
      let filter = {};
      if (req.filter) {
      filter = req.filter;
      }
        const groupFilters = await groupsFilter(loggedInUserId);
        
        const acceptedOrdersFilter = await OnpraseOrdersFilter(loggedInUserId);


    const orders = await Order.find({
      $and: [
      { $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }] },
      { $and: [{ ...acceptedOrdersFilter },{ StateWork: { $ne: 'reject' } }, { State: { $ne: 'reject' } },{ ...filter }] }
    ]
  });

        const countMap = new Map();

        orders.forEach(order => {
            const type1Value = order.senderOrder;
            if (countMap.has(type1Value)) {
                countMap.set(type1Value, countMap.get(type1Value) + 1);
            } else {
                countMap.set(type1Value, 1);
            }
        });

        const result = {};
        countMap.forEach((value, key) => {
            result[key] = value;
        });

        res.status(200).json(result);
    } catch (error) {
        next(new ApiError(`Error filtering orders: ${error.message}`, 500));
    }
})

exports.dataFilterRejectSender =  asyncHandler(async (req,res,next) => {
try {
        const loggedInUserId = req.user._id;

        const groupFilters = await groupsFilter(loggedInUserId);
        
        const acceptedOrdersFilter = await rejectsOrderFilter(loggedInUserId,req);
        
        const filter = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], group: req.user.group };


        const orders = await Order.find({
        $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }],
        $and :[{...acceptedOrdersFilter}], ...filter})

        const countMap = new Map();

        orders.forEach(order => {
            const type1Value = order.senderOrder;
            if (countMap.has(type1Value)) {
                countMap.set(type1Value, countMap.get(type1Value) + 1);
            } else {
                countMap.set(type1Value, 1);
            }
        });

        const result = {};
        countMap.forEach((value, key) => {
            result[key] = value;
        });

        res.status(200).json(result);
    } 
    catch (error)
    {
        next(new ApiError(`Error filtering orders: ${error.message}`, 500));
    }
})

exports.dataFilterArchiveSender =  asyncHandler(async (req,res,next) => {
try {
        const loggedInUserId = req.user._id;

  
  const groupOrderFilters = await groupFilter(loggedInUserId);

  const groupOnpraseFilters = await groupsFilter(loggedInUserId);
        const acceptedOrdersFilter = await ArchiveOrderFilter(loggedInUserId);

        const orders = await Order.find({
       $and: [
      { $or: [{ ...groupOrderFilters },{ ...groupOnpraseFilters }, { usersOnprase: loggedInUserId },{ users: loggedInUserId }] },
      { $and: [{ ...acceptedOrdersFilter }] }
    ]})

        const countMap = new Map();

        orders.forEach(order => {
            const type1Value = order.senderOrder;
            if (countMap.has(type1Value)) {
                countMap.set(type1Value, countMap.get(type1Value) + 1);
            } else {
                countMap.set(type1Value, 1);
            }
        });

        const result = {};
        countMap.forEach((value, key) => {
            result[key] = value;
        });

        res.status(200).json(result);
    } 
    catch (error)
    {
        next(new ApiError(`Error filtering orders: ${error.message}`, 500));
    }
})

