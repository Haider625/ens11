/* eslint-disable prefer-destructuring */

const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel')
const groups = require('../models/groupUser')
const user = require('../models/userModel')
const ApiFeatures = require('../utils/apiFeatures')
const ApiError = require('../utils/apiError');

// exports.getsArchive = asyncHandler(async (req, res, next) => {

//   if (!req.user.Permission.canViwsOrder) {
//     return next(new ApiError('You do not have permission to view this order', 403));
//   }

//   const loggedInUserId = req.user._id;
//   let filter = {};
//   if (req.filter) {
//     filter = req.filter;
//   }

//   const userGroup = await user.findOne({ _id: loggedInUserId });
//   const userGroupLevel = userGroup.group.level;
//   const userGroupInLevel = userGroup.group.inlevel;
  
//   const similarGroups = await groups.find({ level: userGroupLevel, inlevel: userGroupInLevel });


//   const groupIds = similarGroups.map(group => group._id);

//   const groupFilter = {
//     groups: {
//       $in: groupIds ,
//     }
//   };

//   const documentsCounts = await Order.countDocuments();
//   const loggedInUserIdString = loggedInUserId.toString();
//   const acceptedOrdersFilter = {
//     $or: [
//       { createdBy: { $ne: loggedInUserIdString }},
//       {
//         // $and: [
//         //   { State: { $ne: 'reject' } },
//         //   { StateWork: { $ne: 'reject' } },
//         // ]
//       }
//     ],
//     archive: { $ne: false }
//   };



//   const apiFeatures = new ApiFeatures(Order.find({
//     $and: [
//       { $or: [{ ...groupFilter }, { usersOnprase: loggedInUserId }] },
//       { $and: [{ ...acceptedOrdersFilter }, { ...filter }] }
//     ]
//   }), req.query)
//     .paginate(documentsCounts)
//     .limitFields()
//     .sort()
//     .search('Order')

//   const { mongooseQuery, paginationResult } = await apiFeatures;
//   const documents = await mongooseQuery;

//   res
//     .status(200)
//     .json({ results: documents.length, paginationResult, order: documents });
// });
// exports.createArchive = asyncHandler(async (req, res,next) => {

//   if (!req.user.Permission.canCreatArchive) {
//     return next(new ApiError('You do not have permission to create an archives', 403));
//   }

//   const newDoc = await archives.create(
    
//     {
//       orderId : req.body.orderId,
//       completedBy:req.user._id
//     }
//     );
//   if (!newDoc) {
//       return next(
//         new ApiError(`No document for this id ${req.body}`, 404)
//       );
//     }

//     res.status(201).json({ archives: newDoc });
// });

// exports.getArchive =  asyncHandler(async (req, res, next) => {

//   if (!req.user.Permission.canViwOneArchive) {
//     return next(new ApiError('You do not have permission to viw this archives', 403));
//   }

//   const { id } = req.params;
//   const document = await archives.findById(id);
//   if (!document) {
//      return next(new ApiError(`No document for this id ${id}`, 404));
//   }
//   res.status(200).json({ archives: document });
// });

exports.getsArchive = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwsOrder) {
    return next(new ApiError('You do not have permission to view this order', 403));
  }

  const loggedInUserId = req.user._id;
  let filter = {};
  if (req.filter) {
    filter = req.filter;
  }

  const userGroup = await user.findOne({ _id: loggedInUserId });
  const userGroupLevel = userGroup.group.level;
  const userGroupInLevel = userGroup.group.inlevel;
  
  const similarGroups = await groups.find({ level: userGroupLevel, inlevel: userGroupInLevel });


  const groupIds = similarGroups.map(group => group._id);

  const groupsFilter = {
    groups: {
      $in: groupIds ,
    }
  };
  const groupFilter = {
    group: {
      $in: groupIds ,
    }
  };

  const documentsCounts = await Order.countDocuments();
  const loggedInUserIdString = loggedInUserId.toString();
  const acceptedOrdersFilter = {
    $or: [
      { createdBy: { $ne: loggedInUserIdString }},
      {
        // $and: [
        //   { State: { $ne: 'reject' } },
        //   { StateWork: { $ne: 'reject' } },
        // ]
      }
    ],
    archive: { $ne: false }
  };

  const apiFeatures = new ApiFeatures(Order.find({
    $and: [
      { $or: [{ ...groupFilter },{ ...groupsFilter }, { usersOnprase: loggedInUserId },{ users: loggedInUserId }] },
      { $and: [{ ...acceptedOrdersFilter }, { ...filter }] }
    ]
  }), req.query)
    .paginate(documentsCounts)
    .limitFields()
    .sort()
    .search('Order')

  const { mongooseQuery, paginationResult } = await apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, order: documents });
});

// exports.getsArchive = asyncHandler(async (req, res,next) => {

//   if (!req.user.Permission.canViwsArchive) {
//     return next(new ApiError('You do not have permission to viws this archives', 403));
//   }

//   let filter = {};
//   if (req.filterObj) {
//     filter = req.filterObj;
//   }
//   // Build query
//   const documentsCounts = await archives.countDocuments();
//   const apiFeatures = new ApiFeatures(archives.find(filter), req.query)
//     .paginate(documentsCounts)
//     .filter()
//     .search(archives)
//     .limitFields()
//     .sort();

//   // Execute query
//   const { mongooseQuery, paginationResult } = apiFeatures;
//   const documents = await mongooseQuery;

//   res
//     .status(200)
//     .json({ results: documents.length, paginationResult, archives: documents });
// });


// exports.deleteArchive =  asyncHandler(async (req, res, next) => {
    
//   const { id } = req.params;

//   if (!req.user.Permission.canDeletArchive) {
//     return next(new ApiError('You do not have permission to delete this archives', 403));
//   }

//   const document = await archives.findByIdAndDelete(id);

//   if (!document) {
//     return next(new ApiError(`No document for this id ${id}`, 404));
//   }
//   res.status(204).send();
// });

// exports.updateArchive =  asyncHandler(async (req, res, next) => {

//   if (!req.user.Permission.canEidtArchive) {
//     return next(new ApiError('You do not have permission to edit this archives', 403));
//   }

//   const document = await archives.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });

//   if (!document) {
//     return next(
//       new ApiError(`No document for this id ${req.params.id}`, 404)
//     );
//   }

//   res.status(200).json({ archives: document });
// });

// exports.getArchivesAccept = asyncHandler(async (req, res, next) => {
//   try {
//     // ابحث في جميع الطلبات المقبولة في حالة الطلب 'accept' أو 'acceptwork' في حالة العمل
//     const acceptedOrders = await archives.find({
//       $or: [
//         { 'orderId.State': 'accept' },
//         { 'orderId.StateWork': 'endwork' },
//         { 'orderId.StateDone' : 'accept'} 
//       ]
//     }).populate([
//       { 
//         path: 'orderId',
//           select: {
//           '_id' : 1,
//           'type1':1,
//           'type2':1,
//           'type3':1,
//           'number':1,
//           'caption' : 1,
//           'group' : 0,
//           'groups' : 0,
//           'State' : 1,
//           'StateWork' : 1,
//           'StateDone' : 1,
//           'users' : 0,
//           'createdBy' : 0,
//           'history' : 1,
//         },
//         options: { depth: 1 }
//       },
//     ]);
    
//     res.status(200).json({ archives: acceptedOrders });
//   } catch (error) {
//     return next(new ApiError(500, 'Internal Server Error'));
//   }
// });

// exports.getArchivesReject =  asyncHandler(async (req, res, next) => {
//     try {
//       // ابحث في جميع الطلبات المرفوضة في حالة الطلب 'reject' أو 'reject' في حالة العمل
//       const rejectedOrders = await archives.find({
//         $or: [
//           { 'State': 'reject' },
//           { 'StateWork': 'reject' },
//           { 'stateDone' : 'reject'}
//         ]
//       });
  
//       // قم بإرجاع النتائج
//       res.status(200).json({ archives : rejectedOrders });
//     } catch (error) {
//       return next(new ApiError(500, 'Internal Server Error'));
//     }
// });