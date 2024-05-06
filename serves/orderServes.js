/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const Order = require('../models/orderModel');
const groups = require('../models/groupUser');
const user = require('../models/userModel');
const ApiFeatures = require('../utils/apiFeatures');
const ApiError = require('../utils/apiError');
const TypeText1 = require('../models/typeText1');
const TypeText2 = require('../models/typeText2');
const typeText3 = require('../models/typeText3');
const socketHandler  = require('../utils/socket');

const {createMessageHistory,updateMessageHistory} = require('../utils/MessagesHistort');

const { uploadMixOfImages } = require('../middlewares/uploadImage');

exports.uploadOrderImage = uploadMixOfImages([
  {
    name: 'orderimg',
    maxCount: 1,
  },
  {
    name: 'donimgs',
    maxCount: 5,
  },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Image processing for orderimg
  if (req.files && req.files.orderimg) {
    const orderimgFileName = `order-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.files.orderimg[0].buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/orders/${orderimgFileName}`);

    // Save image into our db
    req.body.orderimg = orderimgFileName;
  }

  // Image processing for donimgs
  if (req.files && req.files.donimgs) {
    req.body.donimgs = [];
    await Promise.all(
      req.files.donimgs.map(async (img, index) => {
        const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
  
        await sharp(img.buffer)
          .resize(600, 600)
          .toFormat('jpeg')
          .jpeg({ quality: 95 })
          .toFile(`uploads/orders/${imageName}`, (err) => {
            if (err) {
              console.error('Error saving image:', err);
            } else {
              req.body.donimgs.push(imageName) ;
            }
          });
      })
    );
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
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const lowerLevelGroup = users.group.levelSend;

  if (!lowerLevelGroup) {
    return  next(new ApiError(`Not found levelSend`, 404));
  }

  const groupss = [users.group._id];

  const orderData = {
    type1: req.body.type1,
    type2: req.body.type2,
    type3: req.body.type3,
    caption: req.body.caption,
    number : req.body.number,
    group: lowerLevelGroup ,
    groups: groupss ,
    createdBy: req.user,
    user : req.body.user,
    orderimg : req.body.orderimg,
    donimgs :req.body.donimgs,
  };


  const newOrder = await Order.create(orderData);

  newOrder.createdAt =Date.now()
  newOrder.updatedAt =Date.now()

    newOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: createMessageHistory
  });
  newOrder.save()
  const roomgroup = newOrder.group.name;

  const message = {
    type: "new_order",
    title: "طلب جديد",
    body : `تم وصول طلب جديد من قبل ${newOrder.group.name}`,
    action: "open_page",
    page : "home",
    orderID: newOrder._id,
    time : newOrder.updatedAt
}

  socketHandler.sendNotificationToRoom(roomgroup,message);

  res.status(201).json({ order: newOrder });

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

exports.updateOrder = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;

  if (!req.user.Permission.canEidtOrder) {
    return next(new ApiError('You do not have permission to edit this order', 403));
  }

  const currentOrder = await Order.findById(req.params.id);

  if (!currentOrder) {
    return next(new ApiError('Order not found', 404));
  }

  const updatedOrder = await Order
    .findByIdAndUpdate(req.params.id, { ...req.body}, { new: true })
    .populate('donimgs');

  updatedOrder.updatedAt =Date.now()

  updatedOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: `تم تعديل الطلب من قبل`
  });

  await updatedOrder.save();

  res.status(200).json({ order: updatedOrder });
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

  const userGroup = await user.findOne({ _id: loggedInUserId });
  const userGroupLevel = userGroup.group.level;
  const userGroupInLevel = userGroup.group.inlevel;
  
  const similarGroups = await groups.find({ level: userGroupLevel, inlevel: userGroupInLevel });


  const groupIds = similarGroups.map(group => group._id);

  const groupFilter = {
    groups: {
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
    archive: { $ne: true }
  };

  const apiFeatures = new ApiFeatures(Order.find({
    $and: [
      { $or: [{ ...groupFilter }, { usersOnprase: loggedInUserId }] },
      { $and: [{ ...acceptedOrdersFilter }, { ...filter }] }
    ]
  }), req.query)
    .paginate(documentsCounts)
    .search('Order')
    .limitFields()
    .sort();


  const { mongooseQuery, paginationResult } = await apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, order: documents });
});

exports.getOrders = asyncHandler(async (req, res, next) => {

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
  
  const groupFilter = { group: { $in: groupIds } };
  const groupsFilter = {
    groups: {
      $in: groupIds ,
    }
  };
  
  const documentsCounts = await Order.countDocuments();

  const loggedInUserIdString = loggedInUserId.toString();
  

  const acceptedOrdersFilter = {
    $or: [
      { createdBy: { $ne: loggedInUserIdString }},
      {
        $and: [
          { State: { $ne: 'reject' } },
          { StateWork: { $ne: 'reject' }  },

        ]
      }
    ],
    archive: { $ne: true }
  };
  const acceptedOrdersOnepressFilter = {
    $or: [
      { createdBy: { $ne: loggedInUserIdString }},
      {
        // $and: [
        //   { State: { $ne: 'reject' } },
        //   { StateWork: { $ne: 'reject' } }
        // ]
      }
    ],
    archive: { $ne: true }
  };
  const acceptedOrdersFilters = {
    $or: [
      { createdBy: loggedInUserIdString },
      {
        $and: [
          { State: 'reject' },
          { StateWork: 'reject'},
          { StateDone: 'reject' },
          
        ]
      }
    ],
    archive: { $ne: true }
  }

  const apiFeatures = new ApiFeatures(Order.find({ 
      $and: [
      {$or: [{ ...groupFilter }, { users: loggedInUserId }],},
      {$and :[{...acceptedOrdersFilter},{ StateWork: { $ne: 'endwork' } }], ...filter }
      ]
    }), 
    req.query
  )
    .paginate(documentsCounts)
    .search('Order')
    .limitFields()
    .sort();
  
  const { mongooseQuery, paginationResult } =  apiFeatures;

  const documents = await mongooseQuery;

  const countOnepreasApiFeatures = new ApiFeatures(Order.find({$or: [{ ...groupsFilter }, { usersOnprase: loggedInUserId }],$and :[{...acceptedOrdersOnepressFilter}], ...filter}), req.query)

  const { mongooseQuery: countOnepreasMongooseQuery } =  countOnepreasApiFeatures;
  const countOnepreas = await countOnepreasMongooseQuery;
  const filters = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], group: req.user.group };

  const countRejectApiFeatures = new ApiFeatures(Order.find({$or: [{ ...groupsFilter }, { usersOnprase: loggedInUserId }],$and :[{...acceptedOrdersFilters}], ...filters}), req.query)
  const { mongooseQuery: countRejectMongooseQuery } =  countRejectApiFeatures;
  const countReject = await countRejectMongooseQuery;
  res
    .status(200)
    .json({ 
      results: documents.length,
       paginationResult ,
       CountOnepreas:countOnepreas .length, 
       countReject : countReject.length,
       orders: documents 
      });
});

exports.getAllText = asyncHandler(async (req, res, next) => {
  try {

    const typeText1Data = await TypeText1.find({});

 
    const typeText2Data = await TypeText2.find({});


    const typeText3Data = await typeText3.find({});

 
    res.status(200).json({ typeText1Data, typeText2Data, typeText3Data });
  } catch (error) {
    next(new ApiError(`Error fetching data: ${error.message}`, 500));
  }
});

exports.putOrder = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  const orderId = req.params.orderId;
  const userDoc = await user.findOne({ _id: loggedInUserId });

  if (!req.user.Permission.canCreatOrder) {
    return next(new ApiError('You do not have permission to update this order', 403));
  }

  // ابحث عن الطلب الحالي باستخدام findById
  const currentOrder = await Order
  .findByIdAndUpdate(orderId, { ...req.body}, { new: true })
  .populate('donimgs');

  if (!currentOrder) {
    return next(new ApiError('Order not found', 404));
  }

  if (!userDoc) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const loggedInUserIdString = loggedInUserId.toString();

  if (
    currentOrder.createdBy &&
    currentOrder.createdBy._id &&
    loggedInUserIdString !== currentOrder.createdBy._id.toString()
  ) {
    return next(new ApiError('You cannot update this order', 403));
  }

  const lowerLevelGroup = userDoc.group.levelSend;
  
  if (!lowerLevelGroup) {
    return next(new ApiError(`Not found levelSend`, 404));
  }

  const groupss = [userDoc.group._id];

  currentOrder.set({
    // ...req.body,
    // orderimg : req.body.orderimg,
    group: lowerLevelGroup,
    groups: groupss,
    createdBy: req.user._id,
  });

  currentOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: updateMessageHistory
  });

  currentOrder.State = 'onprase';
  currentOrder.StateWork = 'onprase';
  currentOrder.StateDone = 'onprase';

  currentOrder.updatedAt =Date.now()

  await currentOrder.save();
  const updatOrder = await Order.findById(currentOrder._id).populate('group');
  const roomgroup = updatOrder.group.name;

  const message =  {
    type: "order_update",
    title: "طلب جديد",
    body :`تم تعديل طلب من قبل ${updatOrder.group.name}`,
    action: "open_page",
    page : "home",
    orderID: updatOrder._id,
    time : updatOrder.updatedAt
}
  socketHandler.sendNotificationToRoom(roomgroup,message);

  res.status(200).json({ order: currentOrder });
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

  const documents = await Order.find({});

  if (!documents || documents.length === 0) {

    return res.status(204).json({ message: 'No documents found.' });
  }

  res.status(200).json({ results : documents.length, documents: documents });
})