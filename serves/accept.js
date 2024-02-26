const asyncHandler = require('express-async-handler');

const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp')

const Order = require('../models/orderModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const Archive = require('../models/archive')

const { uploadMixOfImages } = require('../middlewares/uploadImage');

exports.uploadOrderImage = uploadMixOfImages([

  {
    name: 'donimgs',
    maxCount: 5,
  },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {
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

exports.getUsersInGroup = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;

  if (!req.user.Permission.canAcceptOrder || !req.user.Permission.canAcceptWork) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const user = await User.findOne({ _id: loggedInUserId });
  
  if (!user || !user.group) {
    return res.status(404).json({ message: 'User not associated with any group' });
  }

  const usersInGroup = await User.find({ group: user.group  },{_id:1,name:1 , group :0,GroupscanViw:0})

  const usersInGroups = await User.find({ group: user.group.levelsReceive },{_id:1,name:1 , group :0,GroupscanViw:0});


  const mergedData  = [usersInGroup,usersInGroups]

  return res.status(200).json({ users : mergedData });
});

exports.getUserOrders = asyncHandler(async (req, res, next) => {
  try {

    const userId = req.user._id;
    
    const userOrders = await Order.find({ 'users': userId });

    res.status(200).json({ accept: userOrders });
  } catch (error) {

    console.error('Error in getUserOrders:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.acceptOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id; 
  const loggedUser = req.user
  const {users , reason } = req.body;
 
  if (!req.user.Permission.canAcceptOrder) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { 
        State: 'accept',
        StateReasonAccept : reason,
        users : users,
        $addToSet: { usersOnprase: req.body.users } 
  },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId ,
  action : `تم قبول الطلب من قبل`,
  reason : reason
});


if (updatedOrder.groups === null || updatedOrder.groups === undefined) {
  updatedOrder.groups = [loggedUser.group];
} else {
  updatedOrder.groups.push(loggedUser.group);
}

updatedOrder.usersOnprase.push(updatedOrder.users);

updatedOrder.group = null ;

await updatedOrder.save();

  res.status(200).json({accept : updatedOrder });
});

exports.acceptwork = asyncHandler(async(req,res,next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const {reason} = req.body
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {   
     
      StateWork: 'acceptwork',
      StateWorkReasonAccept : reason,
      users : loggedInUserId,
      $addToSet: { usersOnprase: req.body.loggedInUserId } 
      
    },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
 action : `تم قبول العمل من قبل`,
 reason : reason
});



await updatedOrder.save();
  
  res.status(200).json({accept : updatedOrder });
});

exports.startWork = asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const orderId = req.params.id;
  const {reason} = req.body
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        StateWork: 'startwork',
        StateWorkReasonAccept : reason ,
        users : loggedInUserId,
        $addToSet: { usersOnprase: req.body.loggedInUserId }
        }
    },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
  action : `تم بدء العمل من قبل` ,
  reason: reason
});

await updatedOrder.save();
  
  res.status(200).json({ accept : updatedOrder });
});

exports.endWork = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  const {reason} = req.body
  const currentOrder = await Order.findById(req.params.id);

  if (!currentOrder) {
    return next(new ApiError('Order not found', 404));
  }

  const updatedOrder = await Order
    .findByIdAndUpdate(req.params.id, { ...req.body}, { new: true })
    .populate('donimgs');

  updatedOrder.StateWork = 'endwork'
  updatedOrder.StateWorkReasonAccept = reason
  updatedOrder.users = loggedInUserId ;
  updatedOrder.usersOnprase = {$addToSet: { usersOnprase: req.body.loggedInUserId }}
  updatedOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: `تم انهاء العمل من قبل`,
    reason:reason
  });
  
  await updatedOrder.save();

  res.status(200).json({ order: updatedOrder });
});

exports.confirmWorkCompletion =  asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const orderId = req.params.id;
  const {reason} = req.body
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { 
      
        StateDone: 'accept',
        StateDoneReasonAccept : reason
        
    },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
  action : `تم تاكيد اتمام العمل من قبل`,
  reason : reason
});

await updatedOrder.save();

  
  res.status(200).json({ accept : updatedOrder });
});

exports.AcceptArchive = asyncHandler(async (req, res, next) => {
 
    try {
      const orderId = req.params.id;
  
      // التحقق مما إذا كان حالة الطلب 'done'
      // const order = await Order.findById(orderId);
      // if (!order || order.StateDone !== 'accept') {
      //   return next(new ApiError(`Order not found or not in 'done' state`, 404));
      // }
      // إنشاء سجل للطلب المكتمل
      const completedRequest = new Archive({
        orderId: orderId,
        completedBy: req.user._id, // افتراض وجود نظام المصادقة وتوفر معرف المستخدم
        completionDate: new Date(),
      });
      // حفظ السجل في جدول الأرشيف
      await completedRequest.save();

      await Order.findByIdAndUpdate(orderId, { users: null, group: null ,groups :null });
      // await orderId.save();
      // (اختياري) يمكنك إزالة الطلب من جدول الطلبات إذا أردت
      //  const order = await Order.findByIdAndRemove(orderId);
  
      res.status(200).json({ accept : completedRequest});
    } catch (error) {
      return next(new ApiError(500, 'Internal Server Error'));
    }
});
  
