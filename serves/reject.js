/* eslint-disable prefer-destructuring */
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel')
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const archive = require('../models/archive')
const groups = require('../models/groupUser')
const user = require('../models/userModel')
const socketHandler  = require('../utils/socket');

exports.getRejectedOrders = asyncHandler(async (req, res) => {

  const filter = { State: 'reject', groups: req.user.group };
    // Build query
    const documentsCounts = await Order.countDocuments();
    const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(Order)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

exports.getRejectedWorks = asyncHandler(async (req, res) => {

  const filter = { StateWork: 'reject', groups: req.user.group };
    // Build query
    const documentsCounts = await Order.countDocuments();
    const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(Order)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

exports.getRejectedDone = asyncHandler(async (req, res) => {

  const filter = { StateDone: 'reject', groups: req.user.group };
    // Build query
    const documentsCounts = await Order.countDocuments();
    const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(Order)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

exports.getAllRejected = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  // let filter = {};
  // if (req.filter) {
    
  //   filter = req.filter;
  // }

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
  const filter = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], group: req.user.group };

    const documentsCounts = await Order.countDocuments();
    const loggedInUserIdString = loggedInUserId.toString();
    const acceptedOrdersFilter = {
      $or: [
        { createdBy: loggedInUserId },
        {
          $and: [
            { State: 'reject' },
            { StateWork: 'reject' },
            { StateDone: 'reject' }
          ]
        }
      ],
      archive: { $ne: true }
    }

    const apiFeatures = new ApiFeatures(Order.find({$or: [{ ...groupFilter }, { usersOnprase: loggedInUserId }],$and :[{...acceptedOrdersFilter}], ...filter}), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(Order)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, order: documents });
  });

exports.getUserOrders = asyncHandler(async (req, res, next) => {
  try {
    // استخدام معرّف المستخدم من req.user
    const userId = req.user._id;

    // البحث عن الطلبات التي يكون معرّف المستخدم في حقل users
    const userOrders = await Order.find({ 'users': userId });

    // إرسال النتائج إلى العميل
    res.status(200).json({ data: userOrders });
  } catch (error) {
    // في حالة وجود أي خطأ، يتم إرسال استجابة خطأ إلى العميل
    console.error('Error in getUserOrders:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.rejectOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectOrder) {
    return next(new ApiError('Unauthorized to reject orders' ,403));
  }

    const rejectOrder = await Order.findByIdAndUpdate(
      orderId
      );

    if (!rejectOrder) {
      return next(new ApiError(`No order found for this id`, 404));
    }

    rejectOrder.State = 'reject';
    rejectOrder.StateReasonReject = reason;

    rejectOrder.history.push({
      editedAt: Date.now(),
      editedBy: userId,
      action: `تم رفض الطلب من قبل`,
      reason: reason
    });
    if (rejectOrder.State === 'reject'){
      const lastGroup = rejectOrder.groups[rejectOrder.groups.length - 1]
      rejectOrder.group = lastGroup ;
      rejectOrder.groups.pop();
    }else{
      const lastGroup = rejectOrder.groups[rejectOrder.groups.length -1]
      rejectOrder.group = lastGroup ;
    }

    // let lastGroupIndex;

    // if (rejectOrder.State === 'reject') {
    //   // إذا كانت الحالة "رفض"، قم بتحديد الفهرس الخاص بآخر عنصر في المصفوفة
    //   lastGroupIndex = rejectOrder.groups.length - 1;
    //   rejectOrder.group = rejectOrder.groups[lastGroupIndex];
    // } else {
    //   // إذا لم تكن الحالة "رفض"، قم بتحديد الفهرس الخاص بآخر عنصر في المصفوفة
    //   lastGroupIndex = rejectOrder.groups.length;
    //   rejectOrder.group = rejectOrder.groups[lastGroupIndex];
    // }
    
    // // عند إعادة تنفيذ الشرط وكون الحالة "رفض"، قلل قيمة lastGroupIndex بواحد
    // if (rejectOrder.State === 'reject') {
    //   lastGroupIndex -= 1;
    // }
    
    // // يمكنك استخدام lastGroupIndex حسب احتياجاتك فيما بعد
    // console.log('Last Group Index:', lastGroupIndex);
    
    // if (rejectOrder.groups === null || rejectOrder.groups === undefined) {
    //   rejectOrder.groups = [loggedUser.group];
    // } else {
    //   rejectOrder.groups.push(loggedUser.group);
    // }
    rejectOrder.updatedAt =Date.now()
    await rejectOrder.save();

    const updatOrder = await Order.findById(rejectOrder._id).populate('group');

    const roomgroup = updatOrder.group.name;
    const message = 'تم رفض الطلب';
    socketHandler.sendNotificationToRoom(roomgroup,message);

    res.status(200).json({ order : rejectOrder });
});

exports.rejectWork = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectWork) {
    return next(new ApiError('Unauthorized to reject work' ,403));
  }

    const rejectWork = await Order.findById(orderId);

    if (!rejectWork) {
      return next(new ApiError(`No order found for this id`, 404));
    }

    rejectWork.StateWork = 'reject';
    rejectWork.StateWorkReasonReject = reason;

    rejectWork.history.push({
      editedAt: Date.now(),
      editedBy: userId,
      action: `تم رفض العمل من قبل`,
      reason: reason
    });

    // const lastGroup = rejectWork.groups[rejectWork.groups.length - 1]

    // rejectWork.group = lastGroup ;

    if (rejectWork.StateWork === 'reject'){
      const lastGroup = rejectWork.usersOnprase[rejectWork.usersOnprase.length - 1]
      rejectWork.users = lastGroup ;
      rejectWork.usersOnprase.pop();
    }else{
      const lastGroup = rejectWork.usersOnprase[rejectWork.usersOnprase.length -1]
      rejectWork.users = lastGroup ;
    }

    // if (rejectWork.userOrders === null || rejectWork.usersOnprase === undefined) {
    //   const lastGroup = rejectWork.usersOnprase[rejectWork.usersOnprase.length ]
    //   rejectWork.users = lastGroup ;

    // } else {
    //   const lastGroup = rejectWork.usersOnprase[rejectWork.usersOnprase.length -1]
    //   rejectWork.users = lastGroup ;
    //   rejectWork.usersOnprase.pop();
    // }
    rejectWork.updatedAt =Date.now()
    await rejectWork.save();

  const updatOrder = await Order.findById(rejectWork._id).populate('users');

  const roomUser = updatOrder.users.userId;
  const message = 'تم رفض تنفيذ الطلب';
  socketHandler.sendNotificationToUser(roomUser,message);

    res.status(200).json({ order :updatOrder });
});

exports.rejectConfirm = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectWork) {
    return next(new ApiError('Unauthorized to reject work' ,403));
  }
    // العثور على الطلب وتحديث حالته
    const rejectConfirm = await Order.findById(orderId);

    if (!rejectConfirm) {
      return next(new ApiError(`No order found for this id`, 404));
    }
    rejectConfirm.StateWork = 'onprase';
    rejectConfirm.StateDone = 'reject';
    rejectConfirm.StateDoneReasonReject = reason;

    // إضافة معلومات السجل
    rejectConfirm.history.push({
      editedAt: Date.now(),
      editedBy: userId,
      action: `تم رفض تنفيذ العمل من قبل`,
      reason: reason
    });

    const lastGroup = rejectConfirm.usersOnprase[rejectConfirm.usersOnprase.length -3]
    rejectConfirm.users = lastGroup;
    rejectConfirm.updatedAt =Date.now()
    await rejectConfirm.save();

    const updatOrder = await Order.findById(rejectConfirm._id).populate('users');

    const roomUser = updatOrder.users.userId;
    const message = 'تم رفض تنفيذ العمل على الطلب';
    socketHandler.sendNotificationToUser(roomUser,message);

    res.status(200).json({ order:rejectConfirm });
});

exports.archiveReject = asyncHandler(async (req, res, next) => {

    const orderId = req.params.id;

    // العثور على الطلب الحالي
    const currentOrder = await Order.findById(orderId);

    // التحقق مما إذا كان الطلب موجودًا
    if (!currentOrder) {
      return next(new ApiError(404, 'Order not found'));
    }
    currentOrder.archive = true;
    currentOrder.updatedAt =Date.now()
    currentOrder.save()
    
    res.status(200).json({ order : currentOrder });
});
