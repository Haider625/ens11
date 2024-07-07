/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const fs = require('fs').promises;
const Order = require('../models/orderModel');
const user = require('../models/userModel');
const ApiError = require('../utils/apiError');

const socketHandler  = require('../utils/socket');

const {createMessageHistory,updateMessageHistory} = require('../utils/MessagesHistort');

const {createDataSocket,updatedatasocket} = require('../utils/MessagesSocket')

// const { sanitizeType1,sanitizeOrder} = require('../utils/sanaitizeData')

const {addToOrderHistory ,calculateTimeDifference , setOrderDetails} = require('../middlewares/handleStandardActions')

const { uploadMixOfImages } = require('../middlewares/uploadImage');

exports.uploadOrderImage = uploadMixOfImages([
  {
    name: 'orderimg',
    maxCount: 5,
  },
  {
    name: 'donimgs',
    maxCount: 5,
  },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Image processing for orderimg
  // if (req.files && req.files.orderimg) {
  //   const orderimgFile = req.files.orderimg[0]; // Get the uploaded file object
  //   const orderimgFileName = `order-${uuidv4()}-${Date.now()}.jpeg`; // Generate a unique file name

  //   // Resize and save the image
  //   await sharp(orderimgFile.path)
  //   .resize(600, 1080)
  //   .toFormat('jpeg')
  //   .jpeg({ quality: 95 })
  //      .toFile(`uploads/orders/${orderimgFileName}`);

  //   // Save image into our db
  //   req.body.orderimg = orderimgFileName;
  // }

  if (req.files && req.files.orderimg) {
    req.body.orderimg = [];
    await Promise.all(
      req.files.orderimg.map(async (img, index) => {
        const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
  
        await sharp(img.path)
        .resize(1000, 1000)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
          .toFile(`uploads/orders/${imageName}`)
     
          req.body.orderimg.push(imageName) ;  
      // console.log(orderimg)
      })
    );
  }
  // Image processing for donimgs
  if (req.files && req.files.donimgs) {
    req.body.donimgs = [];
    await Promise.all(
      req.files.donimgs.map(async (img, index) => {
        const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
  
        await sharp(img.path)
        .resize(1000, 1000)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
          .toFile(`uploads/orders/${imageName}`)
     
          req.body.donimgs.push(imageName) ;  
      
      })
    );
  }
  try {
    const files = await fs.readdir('uploads/test');
    // Iterate through files and delete them
    await Promise.all(files.map(async (file) => {
      await fs.unlink(`uploads/test/${file}`);
      // console.log(`File ${file} deleted successfully.`);
    }));
    // console.log('Contents of "uploads/test" directory deleted successfully.');
  } catch (err) {
    // console.error('Error deleting contents of "uploads/test" directory:', err);
  }
  next();
});

exports.createOrderSend = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  const users = await user.findOne({ _id: loggedInUserId });

  if (!req.user.Permission.canCreatOrder) {
    return next(new ApiError('You do not have permission to create this order', 403));
  }

  if (!users) {
    return next(new ApiError( 'User not found' ,403 ));
  }

  const lowerLevelGroup = users.group.levelSend;

  if (!lowerLevelGroup) {
    return  next(new ApiError(`Not found levelSend`, 404));
  }

  const groupss = [users.group._id];

const newOrder = await Order.create(req.body);

 newOrder.createdBy = loggedInUserId
  newOrder.group = lowerLevelGroup
  newOrder.groups = groupss
  newOrder.createrGroupId = req.user.group.id
  newOrder.createrGroupName = req.user.group.name
  setOrderDetails(newOrder,req.user)
  newOrder.createdAt =Date.now()


  newOrder.TimeReceive = Date.now();
// const timeDifference =calculateTimeDifference(newOrder.history)

  addToOrderHistory(
    newOrder,
    loggedInUserId,
    createMessageHistory,
    // '',
    // 0,
    // 0,
    // 0,
    // 0
  )

  newOrder.save()
  const roomgroup = newOrder.group.name;

  const message = createDataSocket(newOrder)
  //  {
    // type: "new_order",
    // title: "طلب جديد",
    // body : `تم وصول طلب جديد من قبل ${newOrder.group.name}`,
    // action: "open_page",
    // page : "home",
    // orderID: newOrder._id,
    // time : newOrder.updatedAt
// }
console.log(message)

  socketHandler.sendNotificationToRoom(roomgroup,message);

res.status(201).json({ message: 'Order created successfully' ,newOrder});

});

exports.getOrder = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwOneOrder) {
    return next(new ApiError('You do not have permission to viw this order', 403));
  }

  const { id } = req.params;

  const document = await Order.findById(id);

  if (!document) {
     return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ order: document });
});

exports.deleteOrder = asyncHandler(async (req, res, next) => {
    
  const { id } = req.params;

  if (!req.user.Permission.canDeletOrder) {
    return next(new ApiError('You do not have permission to delete this order', 403));
  }

  const document = await Order.findByIdAndDelete(id);

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});

// exports.getOnpraseOrders = asyncHandler(async (req, res, next) => {

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
//        }
//     ],
//     archive: { $ne: true }
//   };

//   const apiFeatures = new ApiFeatures(Order.find({
//     $and: [
//       { $or: [{ ...groupFilter }, { usersOnprase: loggedInUserId }] },
//       { $and: [{ ...acceptedOrdersFilter }, { ...filter }] }
//     ]
//   }), req.query) 
//     .paginate(documentsCounts)
//     .search('Order')
//     .limitFields()
//     .sort();


//   const { mongooseQuery, paginationResult } = await apiFeatures;
//   const documents = await mongooseQuery;

//   res
//     .status(200)
//     .json({ results: documents.length, paginationResult, order: documents });
// });

// exports.getOrders = asyncHandler(async (req, res, next) => {

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
  
//   const groupFilter = { group: { $in: groupIds } };
//   const groupsFilter = {
//     groups: {
//       $in: groupIds ,
//     }
//   };
  
//   const documentsCounts = await Order.countDocuments();

//   const loggedInUserIdString = loggedInUserId.toString();
  

//   const acceptedOrdersFilter = {
//     $or: [
//       { createdBy: loggedInUserIdString },
//       {
//         $and: [
//           { State: { $ne: 'reject' } },
//           { StateWork: { $ne: 'reject' }  },

//         ]
//       }
//     ],
//     archive: { $ne: true }
//   };
//   const acceptedOrdersOnepressFilter = {
//     $or: [
//       { createdBy: { $ne: loggedInUserIdString }},
//       {
//         // $and: [
//         //   { State: { $ne: 'reject' } },
//         //   { StateWork: { $ne: 'reject' } }
//         // ]
//       }
//     ],
//     archive: { $ne: true }
//   };
//   const acceptedOrdersFilters = {
//     $or: [
//       { createdBy: { $ne: loggedInUserIdString } },
//       {
//         $and: [
//           { State: 'reject' },
//           { StateWork: 'reject'},
//           { StateDone: 'reject' },
          
//         ]
//       }
//     ],
//     archive: { $ne: true }
//   }

//   const apiFeatures = new ApiFeatures(Order.find({ 
//       $and: [
//       {$or: [{ ...groupFilter }, { users: loggedInUserId }],},
//       {$and :[{...acceptedOrdersFilter},
//         { StateWork: { $ne: 'confirmWork' } },
//         { StateWork: { $ne: 'endwork' } },], ...filter }
//       ]
//     }), 
//     req.query
//   )
//     .filter()
//     .paginate(documentsCounts)
//     .search('Order')
//     .limitFields()
//     .sort();
  
//   const { mongooseQuery, paginationResult } =  apiFeatures;

//   const documents = await mongooseQuery;

//   const countOnepreasApiFeatures = new ApiFeatures(Order.find({$or: [{ ...groupsFilter }, { usersOnprase: loggedInUserId }],$and :[{...acceptedOrdersOnepressFilter}], ...filter}), req.query)

//   const { mongooseQuery: countOnepreasMongooseQuery } =  countOnepreasApiFeatures;
//   const countOnepreas = await countOnepreasMongooseQuery;
//   const filters = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], group: req.user.group };

//   const countRejectApiFeatures = new ApiFeatures(Order.find({$or: [{ ...groupsFilter }, { usersOnprase: loggedInUserId }],$and :[{...acceptedOrdersFilters}], ...filters}), req.query)
//   const { mongooseQuery: countRejectMongooseQuery } =  countRejectApiFeatures;
//   const countReject = await countRejectMongooseQuery;
//   res
//     .status(200)
//     .json({ 
//       results: documents.length,
//        paginationResult ,
//        CountOnepreas:countOnepreas .length, 
//        countReject : countReject.length,
//        orders: documents 
//       });
// });

exports.putOrder = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  const orderId = req.params.orderId;

  
  if (!req.user.Permission.canCreatOrder) {
    return next(new ApiError('You do not have permission to update this order', 403));
  }

  const userDoc = await user.findOne({ _id: loggedInUserId });

  if (!userDoc) {
    return next(new ApiError('User not found', 404));
  }

  // ابحث عن الطلب الحالي باستخدام findById
  const updatedOrder = await Order
  .findByIdAndUpdate(orderId, { ...req.body}, { new: true })
  .populate('createdBy');

  if (!updatedOrder) {
    return next(new ApiError('Order not found', 404));
  }

  const loggedInUserIdString = loggedInUserId.toString();

  if (
    updatedOrder.createdBy &&
    updatedOrder.createdBy._id &&
    loggedInUserIdString !== updatedOrder.createdBy._id.toString()
  ) {
    return next(new ApiError('You cannot update this order', 403));
  }

  const lowerLevelGroup = userDoc.group.levelSend;
  
  if (!lowerLevelGroup) {
    return next(new ApiError(`Not found levelSend`, 404));
  }

  const groupss = [userDoc.group._id];

  updatedOrder.set({
    ...req.body,
     orderimg : req.body.orderimg,
    group: lowerLevelGroup,
    groups: groupss,
  
  });
const timeDifference =calculateTimeDifference(updatedOrder.history)

  addToOrderHistory(
    updatedOrder,
    loggedInUserId,
    updateMessageHistory,
    '',
    timeDifference.days,
    timeDifference.hours,
    timeDifference.minutes,
    timeDifference.seconds
  )

  // addToOrderHistory(updatedOrder,loggedInUserId,updateMessageHistory)

  // updatedOrder.history.push({
  //   editedAt: Date.now(),
  //   editedBy: loggedInUserId,
  //   action: updateMessageHistory
  // });
  
  updatedOrder.senderOrderId = req.user.group.id 
  updatedOrder.senderOrder = req.user.group.name
  updatedOrder.State = 'onprase';
  updatedOrder.StateWork = 'onprase';
  updatedOrder.StateDone = 'onprase';

  updatedOrder.updatedAt =Date.now()

  newOrder.TimeReceive = Date.now();
  await updatedOrder.save();

  const updatOrder = await Order.findById(currentOrder._id).populate('group');

  const roomgroup = updatOrder.group.name;
  
  message =  updatedatasocket (updatOrder)
//   const message =  {
//     type: "order_update",
//     title: "طلب جديد",
//     body :`تم تعديل طلب من قبل ${updatOrder.group.name}`,
//     action: "open_page",
//     page : "home",
//     orderID: updatOrder._id,
//     time : updatOrder.updatedAt
// }

console.log(message)

  socketHandler.sendNotificationToRoom(roomgroup,message);

  res.status(200).json({ order: currentOrder });
});

exports.updateOrder = asyncHandler(async (req, res, next) => {
  // const loggedInUserId = req.user._id;

  // if (!req.user.Permission.canEidtOrder) {
  //   return next(new ApiError('You do not have permission to edit this order', 403));
  // }

  // const currentOrder = await Order.findById(req.params.id);

  // if (!currentOrder) {
  //   return next(new ApiError('Order not found', 404));
  // }

  // const updatedOrder = await Order
  //   .findByIdAndUpdate(req.params.id, { ...req.body}, { new: true })
  //   .populate('donimgs');

  // updatedOrder.updatedAt =Date.now()

  // updatedOrder.history.push({
  //   editedAt: Date.now(),
  //   editedBy: loggedInUserId,
  //   action: `تم تعديل الطلب من قبل`
  // });

  // await updatedOrder.save();

  // res.status(200).json({ order: updatedOrder });
});