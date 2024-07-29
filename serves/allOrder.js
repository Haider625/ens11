/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/* eslint-disable prefer-destructuring */
const asyncHandler = require('express-async-handler');
const moment = require('moment-timezone');
const Order = require('../models/orderModel');
const apiFeaturesAggregate= require('../utils/apiFeaturesAggregate')
const ApiError = require('../utils/apiError');
const TypeText1 = require('../models/typeText1');
const TypeText2 = require('../models/typeText2');
const typeText3 = require('../models/typeText3')
const user = require('../models/userModel');
const groups = require('../models/groupUser');

const {
  onpraseData,
  rejectFilter,
  ordersData,
  ArchiveFilters,
  groupsFilter,
  OnpraseOrdersFilter
} = require('../middlewares/filtergetOrders')

const search = (req, orders) => {
    if (!req.query.keyword) {
        return orders;
    }

    const { keyword } = req.query;
    const keywordRegex = new RegExp(keyword, 'i');

    return orders.filter(order => 
        ['type1', 'type2', 'type3', 'caption'].some(key => 
            keywordRegex.test(order[key])
        )
    );
};

const filterOrders = (req, orders) => {
    const queryStringObj = { ...req.query };
    const excludesFields = ['page', 'sort', 'keyword', 'order', 'limit', 'fields'];
    excludesFields.forEach((field) => delete queryStringObj[field]);

    for (const key in queryStringObj) {
        if (queryStringObj[key] === 'true') {
            queryStringObj[key] = true;
        } else if (queryStringObj[key] === 'false') {
            queryStringObj[key] = false;
        } else if (!isNaN(queryStringObj[key])) {
            queryStringObj[key] = Number(queryStringObj[key]);
        }
    }

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const matchStage = JSON.parse(queryStr);

    return orders.filter(order => {
        for (const key in matchStage) {
            const filterValue = matchStage[key];
            const orderValue = order[key];

            if (typeof filterValue === 'object' && filterValue !== null) {
                if (filterValue.$gte !== undefined && orderValue < filterValue.$gte) return false;
                if (filterValue.$gt !== undefined && orderValue <= filterValue.$gt) return false;
                if (filterValue.$lte !== undefined && orderValue > filterValue.$lte) return false;
                if (filterValue.$lt !== undefined && orderValue >= filterValue.$lt) return false;
            } else {
                if (orderValue !== filterValue) return false;
            }
        }
        return true;
    });
};

const limitFields = (req, orders) => {
    if (req.query.fields) {
        const fields = req.query.fields.split(',').reduce((acc, field) => {
            acc[field] = 1;
            return acc;
        }, {});
        return orders.map(order => {
            const limitedOrder = {};
            for (let key in fields) {
                limitedOrder[key] = order[key];
            }
            return limitedOrder;
        });
    } else {
        return orders.map(({ __v, ...order }) => order);
    }
};

const countOrdersGroup = (req, orders) => {
    const orderCountQuery = req.query.order === 'asc' ? 1 : -1;
    if (orderCountQuery) {
        const groupedOrders = orders.reduce((acc, order) => {
            const group = order.senderGroupName;
            if (!acc[group]) {
                acc[group] = { group, count: 0, orders: [] };
            }
            acc[group].count++;
            acc[group].orders.push(order);
            return acc;
        }, {});

        return Object.values(groupedOrders)
            .sort((a, b) => (a.count - b.count) * orderCountQuery)
            .flatMap(group => group.orders);
    }
    return orders;
};

const addTimeSinceLastRefresh = (req, orders) => {
    const currentTimeInBaghdad = moment.tz('Asia/Baghdad').toDate();
    return orders.map(order => {
        const lastRefreshTime = new Date(order.updatedAt);
        const timeDifference = currentTimeInBaghdad - lastRefreshTime;
        order.timeSinceLastRefresh = {
            days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((timeDifference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((timeDifference / (1000 * 60)) % 60),
            seconds: Math.floor((timeDifference / 1000) % 60),
        };
        return order;
    });
};

const paginate = (req, orders, documentsCounts) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedOrders = orders.slice(skip, endIndex);

    const pagination = {
        currentPage: page,
        limit: limit,
        numberOfPages: Math.ceil(documentsCounts / limit)
    };

    if (endIndex < documentsCounts) {
        pagination.next = page + 1;
    }

    if (skip > 0) {
        pagination.prev = page - 1;
    }

    return { paginatedOrders, pagination };
};


const sortOrders = (orders, sortQuery) => {
    if (sortQuery) {
        const sortBy = sortQuery.split(',').reduce((acc, field) => {
            const key = field.startsWith('-') ? field.substring(1) : field;
            const order = field.startsWith('-') ? -1 : 1;
            acc[key] = order;
            return acc;
        }, {});
        return orders.sort((a, b) => {
            for (const key in sortBy) {
                if (a[key] < b[key]) return -1 * sortBy[key];
                if (a[key] > b[key]) return 1 * sortBy[key];
            }
            return 0;
        });
    } 
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
};

exports.getOrders = asyncHandler(async (req, res, next) => {
    if (!req.user.Permission.canViwsOrder) {
        return next(new ApiError('You do not have permission to view this order', 403));
    }

    const loggedInUserId = req.user._id;
    let filter = {};
    if (req.filter) {
        filter = req.filter;
    }

    const aggregatePipeline = await ordersData(loggedInUserId);
   

    // Execute aggregate pipeline without sorting
    let Orders = await Order.aggregate(aggregatePipeline);

    Orders = sortOrders(Orders, req.query.sort);
    // تطبيق عمليات البحث والتصفية والفرز والحدود والتجميع والوقت منذ آخر تحديث
    Orders = search(req, Orders);
    Orders = filterOrders(req, Orders);
    Orders = limitFields(req, Orders);
    Orders = countOrdersGroup(req, Orders);
    Orders = addTimeSinceLastRefresh(req, Orders);
    
    // إضافة التصفحة (الـ paginate)
    const { paginatedOrders, pagination } = paginate(req, Orders, Orders.length);

    res.status(200).json({
         results: paginatedOrders.length,
        paginationResult: pagination,
        Orders: paginatedOrders,
           
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

   const groupFilter = await groupsFilter(loggedInUserId);

  const acceptedOrdersFilter = await OnpraseOrdersFilter(loggedInUserId)


  // const aggregatePipeline = [
  //   {
  //   $match:{
  //   $and: [
  //     { $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }] },
  //     { $and: [{ ...acceptedOrdersFilters },{ ...filter }] }
  //   ]
  // }
  // }
  // ]

  // const documentsCounts = await Order.countDocuments();

  // const paginate = await paginateAggregate(req,documentsCounts,aggregatePipeline)


  // const orderQuery = Order.find({
  //   $and: [
  //     { $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }] },
  //     { $and: [{ ...acceptedOrdersFilters },{ ...filter }] }
  //   ]
  // });

  // const apiFeatures =await createApiFeatures(orderQuery, req.query, documentsCounts);
 
  // const { mongooseQuery, paginationResult } = await apiFeatures;

  // // const orderQuery =  Order.find({})

  // const documents = await orderQuery;
const aggregatePipeline = await onpraseData(loggedInUserId,req)

const documentsCounts = await Order.countDocuments();

const aggregateOps = new apiFeaturesAggregate(req, aggregatePipeline)

aggregateOps.paginate(documentsCounts);
aggregateOps.search('Order'); 
aggregateOps.filter();
aggregateOps.sort();
aggregateOps.limitFields();
aggregateOps.countOrdersGroup()

const documents = await Order.aggregate(aggregatePipeline).exec();

const paginationResult = aggregateOps.paginate(documentsCounts);

  res
    .status(200)
    .json({ 
      results: documents.length,
      paginationResult,
      Orders: documents
     });
  // const userGroup = await user.findOne({ _id: loggedInUserId });
  // const userGroupLevel = userGroup.group.level;
  // const userGroupInLevel = userGroup.group.inlevel;
  
  // const similarGroups = await groups.find({ level: userGroupLevel, inlevel: userGroupInLevel });


  // const groupIds = similarGroups.map(group => group._id);

  // const groupFilter = {
  //   groups: {
  //     $in: groupIds ,
  //   }
  // };

  // const documentsCounts = await Order.countDocuments();

  // const loggedInUserIdString = loggedInUserId.toString();
  // const acceptedOrdersFilter = {
  //   $or: [
  //     { createdBy: { $ne: loggedInUserIdString }},
  //     {
  //       $and: [
  //         { State: { $ne: 'reject' } },
  //         { StateWork: { $ne: 'reject' } },
  //       ]
  //      }
  //   ],
  //   archive: { $ne: true }
  // };

  // const apiFeatures = await Order.find({
  //   $and: [
  //     { $or: [{ ...groupFilter }, { usersOnprase: loggedInUserId }] },
  //     { $and: [{ ...acceptedOrdersFilter }, { ...filter }] }
  //   ]
  // })

  // const document = await apiFeatures;

  // res
  //   .status(200)
  //   .json({ results: document.length, order: document });

});

exports.getAllRejected = asyncHandler(async (req, res) => {
 const loggedInUserId = req.user._id;

  // const groupFilters = await groupsFilter(loggedInUserId);
  // const acceptedOrdersFilters = await rejectsOrderFilter(loggedInUserId,req)

  //   const documentsCounts = await Order.countDocuments();

  //   const orderQuery = Order.find({
  //     $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }],
  //     $and :[{...acceptedOrdersFilters}],})

  //    const apiFeatures =await createApiFeatures(orderQuery, req.query, documentsCounts);
 
  //   const { mongooseQuery, paginationResult } = apiFeatures;
  //   const documents = await mongooseQuery;
  
const aggregatePipeline = await rejectFilter(loggedInUserId,req)

const documentsCounts = await Order.countDocuments();

const aggregateOps = new apiFeaturesAggregate(req, aggregatePipeline)

aggregateOps.paginate(documentsCounts);
aggregateOps.search('Order'); 
aggregateOps.filter();
aggregateOps.sort();
aggregateOps.limitFields();
aggregateOps.countOrdersGroup()


const documents = await Order.aggregate(aggregatePipeline);

const paginationResult = aggregateOps.paginate(documentsCounts);

    res
      .status(200)
      .json({ 
        results: documents.length, 
        paginationResult,
        Orders: documents, 
      });

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

  // const groupOrderFilters = await groupFilter(loggedInUserId);

  // const groupOnpraseFilters = await groupsFilter(loggedInUserId);

  // const archiveFilter = await ArchiveOrderFilter(loggedInUserId)

  // const documentsCounts = await Order.countDocuments();
  //  const orderQuery = Order.find({
  //   $and: [
  //     { $or: [{ ...groupOrderFilters },{ ...groupOnpraseFilters }, { usersOnprase: loggedInUserId },{ users: loggedInUserId }] },
  //     { $and: [{ ...archiveFilter }, { ...filter }] }
  //   ]
  // })
  
  // const apiFeatures = await createApiFeatures(orderQuery, req.query, documentsCounts);

  // const { mongooseQuery, paginationResult } = await apiFeatures;

  // const documents = await mongooseQuery;

const aggregatePipeline = await ArchiveFilters(loggedInUserId)

const documentsCounts = await Order.countDocuments();

const aggregateOps = new apiFeaturesAggregate(req, aggregatePipeline)


aggregateOps.search('Order'); 
aggregateOps.filter();
aggregateOps.sort();
aggregateOps.limitFields();
aggregateOps.countOrdersGroup()
aggregateOps.paginate(documentsCounts);

  console.log('Final aggregate pipeline:', JSON.stringify(aggregatePipeline, null, 2));

const documents = await Order.aggregate(aggregatePipeline);

const paginationResult = aggregateOps.paginate(documentsCounts);

  res
    .status(200)
    .json({ 
      results: documents.length, 
      paginationResult, 
      Orders: documents
     });
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

// exports.aggregateAndFindOrders = async (groupOrderFilters, loggedInUserId, OrdersFilters, orderCountQuery, sortOrder, documentsCounts) => {
//   try {
//     // استخدام aggregate للتحليل المعقد
//     const aggregatePipeline = [
//       {
//         $match: {
//           $and: [
//             { $or: [{ ...groupOrderFilters }, { users: loggedInUserId }] },
//             { ...OrdersFilters }
//           ]
//         }
//       }
//     ];

//     if (orderCountQuery) {
//       aggregatePipeline.push(
//         {
//           $group: {
//             _id: "$senderGroupName",
//             count: { $sum: 1 },
//             orders: { $push: "$$ROOT" } // إضافة كل الوثائق في مصفوفة
//           }
//         },
//         { $sort: { count: sortOrder } }, // ترتيب حسب عدد الطلبات بالتنازلي
//         {
//           $facet: {
//             totalOrders: [{ $unwind: "$orders" }, { $replaceRoot: { newRoot: "$orders" } }],
//             groupCounts: [{ $group: { _id: "$senderGroupId", count: { $sum: 1 } } }]
//           }
//         }
//       );
//     }

//     const aggregateResults = await Order.aggregate(aggregatePipeline);

//     // استخدام find للاستعلام عن البيانات بعد عملية ال aggregate
//     const findResults = await Order.find({
//       $and: [
//         { $or: [{ ...groupOrderFilters }, { users: loggedInUserId }] },
//         { ...OrdersFilters }
//       ]
//     })
//       // .search('Order')
//       // .filter()
//       // .paginate(documentsCounts)
//       // .limitFields()
//       // .sort();

//     return { aggregateResults, findResults };
//   } catch (err) {
//     console.error("Error aggregating and finding orders:", err);
//     throw err;
//   }
// }

// exports.getPagination = (req, documentsCounts, aggregatePipeline) => {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 15;
//     const skip = (page - 1) * limit;
//     const endIndex = page * limit;

//     // Push pagination steps into the aggregation pipeline
//     aggregatePipeline.push(
//         { $skip: skip },
//         { $limit: limit }
//     );

//     // Define pagination object
//     const pagination = {
//         currentPage: page,
//         limit: limit,
//         numberOfPages: Math.ceil(documentsCounts / limit)
//     };

//     // Set next page if applicable
//     if (endIndex < documentsCounts) {
//         pagination.next = page + 1;
//     }

//     // Set previous page if applicable
//     if (skip > 0) {
//         pagination.prev = page - 1;
//     }

//     return pagination;
// };

// exports.searchAggregate = (queryString, modelName, aggregateQuery) => {
//     if (!modelName || !queryString.keyword) {
//         return aggregateQuery;
//     }

//     let query = {};

//     const keyword = queryString.keyword;
//     const keywordRegex = new RegExp(keyword, 'i');

//     if (modelName === 'Order') {
//         query.$or = [
//             { type1: { $regex: keywordRegex } },
//             { type2: { $regex: keywordRegex } },
//             { type3: { $regex: keywordRegex } },
//             { caption: { $regex: keywordRegex } },
//         ];
//     } else {
//         query = { name: { $regex: keywordRegex } };
//     }

//     aggregateQuery.push({ $match: query });

//     return aggregateQuery;
// }

// exports.filterAggregate = (req , aggregatePipeline) => {
//     const queryStringObj = { ...req };
//     const excludesFields = ['page', 'sort', 'keyword', 'order', 'limit', 'fields'];
//     excludesFields.forEach((field) => delete queryStringObj[field]);

//     let queryStr = JSON.stringify(queryStringObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     const matchStage = { $match: JSON.parse(queryStr) };
    
//     aggregatePipeline.push(matchStage);
// }

// exports.sortAggregate = (req,aggregatePipeline) => {

// if (req.sort) {
//   const sortBy = {};
//   req.sort.split(',').forEach(field => {
//     sortBy[field.startsWith('-') ? field.substring(1) : field] = field.startsWith('-') ? -1 : 1;
//   });
//   aggregatePipeline.push({ $sort: sortBy });
// } else {
//   // الفرز الافتراضي إذا لم يتم توفير فرز مخصص
//   aggregatePipeline.push({ $sort: { createdAt: -1 } });
// }

// }

// exports.limitFieldAggregate = (req,aggregatePipeline) => {

//     if (req.fields) {
//     const fields = req.fields.split(',').reduce((acc, field) => {
//       acc[field] = 1;
//       return acc;
//     }, {});
//     aggregatePipeline.push({ $project: fields });
//   } else {
//     aggregatePipeline.push({ $project: { __v: 0 } });
//   }
// }

// exports.CountOrders = (orderCountQuery,aggregatePipeline) => {

// if (orderCountQuery) {
//   aggregatePipeline.push(
//     {
//       $group: {
//         _id: "$senderGroupName",
//         count: { $sum: 1 },
//         orders: { $push: "$$ROOT" } // إضافة كل الوثائق في مصفوفة
//       }
//     },
//     { $sort: { count : orderCountQuery } }, // ترتيب حسب عدد الطلبات بالتنازلي
//   {
//       $facet: {
//         totalOrders: [
//           { $unwind: "$orders" },
//           { $replaceRoot: { newRoot: "$orders" } },
//           { $sort: { orderField: orderCountQuery } } // تعديل الترتيب هنا
//         ],
//         groupCounts: [
//           { $group: { _id: "$senderGroupId", count: { $sum: 1 } } }
//         ]
//       }
//     },
//     {
//       $project: {
//         orders: "$totalOrders" // إضافة البيانات المرادة مباشرة داخل الـ orders
//       }
//     }
//   );
// }
// }

 // const orderDataQuerys = await orderDataQuery(orderCountQuery,sortOrder,loggedInUserId)

// مثال بسيط على كيفية استخدام aggregate في Mongoose
// استخدام aggregate مباشرة وتنفيذه
// دمج الخطوات للترقيم (pagination) إلى aggregate pipeline
// const page = parseInt(req.query.page, 10) || 1;
// const limit = parseInt(req.query.limit, 10) || 15;
// const skip = (page - 1) * limit;
//    const endIndex = page * limit;
//    aggregatePipeline.push(
//   { $skip: skip },
//   { $limit: limit }
// );
//         const pagination = {
//             currentPage: page,
//             limit: limit,
//             numberOfPages: Math.ceil(documentsCounts / limit)
//         };
//       // next page
//       if (endIndex < documentsCounts) {
//         pagination.next = page + 1;
//       }
//       if (skip > 0) {
//         pagination.prev = page - 1;
//       }



//   const orderQuery =
//   new ApiFeatures(
//     Order.find({
//     $and: [
//       { $or: [{ ...groupOrderFilters }, { users: loggedInUserId }] },
//       {
//         $and: [
//           { ...OrdersFilters },
//         ],
       
//       },

//     ]

//   })
//   , req.query) 
//     .search('Order')
//     .filter()
//     // .sortByGroupRequests('desc')
//     .paginate(documentsCounts)
//     .limitFields()
//     .sort();

// const aggregatePipeline = [
//   {
//     $match: {
//       $and: [
//         { $or: [{ ...groupOrderFilters }, { users: loggedInUserId }] },
//         { ...OrdersFilters }
//       ]
//     }
//   },
// ];

// if (orderCountQuery) {
//   aggregatePipeline.push(
//     {
//       $group: {
//         _id: "$senderGroupName",
//         count: { $sum: 1 },
//         orders: { $push: "$$ROOT" } // إضافة كل الوثائق في مصفوفة
//       }
//     },
//     { $sort: { count : sortOrder } }, // ترتيب حسب عدد الطلبات بالتنازلي
//     {
//       $facet: {
//         totalOrders: [{ $unwind: "$orders" }, { $replaceRoot: { newRoot: "$orders" } }],
//         groupCounts: [{ $group: { _id: "$senderGroupId", count: { $sum: 1 } } }]
//       }
//     }
//   );
// }
// const orderDataQuerys = await orderDataQuery(orderCountQuery,sortOrder,loggedInUserId)

// const aggregateQuery = Order.aggregate(orderDataQuerys);

// const orderQuery = new ApiFeatures(aggregateQuery, req.query)
//   .search('Order')
//   .filter()
//   .paginate(documentsCounts)
//   .limitFields()
//   .sort();

// try {
//   const result = await orderQuery; // تنفيذ الاستعلام بدون execute()

//   console.log(result); // جميع الطلبات بدون التجميع
// } catch (error) {
//   console.error('Error executing order query:', error);
// }



  // const apiFeatures = createApiFeatures(orderQuery, req.query, documentsCounts,req);
  
  // const { mongooseQuery, paginationResult } = await orderQuery;

  // const documents = await mongooseQuery;

//     // حساب الوقت منذ آخر تحديث
//  documents.forEach(order => {
//     const lastRefreshTime = order.updatedAt; // افترض أن هذه هي قيمة الوقت السابق للطلب
//     const currentTime = moment(); // الوقت الحالي
//     const timeDiff = moment.duration(currentTime.diff(lastRefreshTime));

//     order.timeSinceLastRefresh = {
//       days: timeDiff.days(),
//       hours: timeDiff.hours(),
//       minutes: timeDiff.minutes(),
//       seconds: timeDiff.seconds()
//     };
//   });

  // حفظ التغييرات
  // await Promise.all(documents.map(order => order.save())); 

  //  documents = documents.map(order => {
  //   const timeSinceLastUpdate = moment().diff(moment(order.updatedAt), 'minutes'); // حساب الفرق بالدقائق
  //   return { ...order._doc, timeSinceLastUpdate }; // إضافة الوقت منذ آخر تحديث إلى نتيجة الطلب
  // });