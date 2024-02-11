const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const Archive = require('../models/archive')

exports.getUsersInGroup = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;

  if (!req.user.Permission.canAcceptOrder || !req.user.Permission.canAcceptWork) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  // احصل على المجموعة التي ينتمي إليها المستخدم المسجل
  const user = await User.findOne({ _id: loggedInUserId });
  
  if (!user || !user.group) {
    return res.status(404).json({ message: 'User not associated with any group' });
  }

  // احصل على جميع المستخدمين الذين ينتمون إلى نفس المجموعة
  const usersInGroup = await User.find({ group: user.group  });

  const usersInGroups = await User.find({ group: user.group.levelsReceive  });

  return res.status(200).json({accept : usersInGroup ,usersInGroups });
});

exports.getUserOrders = asyncHandler(async (req, res, next) => {
  try {
    // استخدام معرّف المستخدم من req.user
    const userId = req.user._id;
    
    // البحث عن الطلبات التي يكون معرّف المستخدم في حقل users
    const userOrders = await Order.find({ 'users': userId });

    // إرسال النتائج إلى العميل
    res.status(200).json({ accept: userOrders });
  } catch (error) {
    // في حالة وجود أي خطأ، يتم إرسال استجابة خطأ إلى العميل
    console.error('Error in getUserOrders:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.acceptOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id; // افتراض وجود نظام المصادقة وتوفر معرف المستخدم
  
  const {users , reason } = req.body;
 
  if (!req.user.Permission.canAcceptOrder) {
    return res.status(403).json({ message: 'Permission denied' });
  }
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { 
        State: 'accept',
        StateReasonAccept : reason,
        users : users
  },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId ,
  action : `تم قبول طلبك من قبل ${loggedInUserId}`,
  reason : reason
});
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
      StateWorkReasonAccept : reason
      
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
 action : `تم قبول العمل على طلبك من قبل ${loggedInUserId}`,
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
        StateWorkReasonAccept : reason
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
  action : `تم بدء العمل على طلبك من قبل ${loggedInUserId}` ,
  reason: reason
});

await updatedOrder.save();
  
  res.status(200).json({ accept : updatedOrder });
});

exports.endWork = asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const orderId = req.params.id;
  const {reason} = req.body
  
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { 
     
      StateWork: 'endwork',
      StateWorkReasonAccept : reason
      
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
  action : `تم انهاء العمل على طلبك من قبل ${loggedInUserId}`,
  reason : reason
});

await updatedOrder.save();

  res.status(200).json({ accept : updatedOrder });
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
  action : `تم بدء العمل على طلبك من قبل ${loggedInUserId}`,
  reason : reason
});

await updatedOrder.save();

  
  res.status(200).json({ accept : updatedOrder });
});

exports.AcceptArchive = asyncHandler(async (req, res, next) => {
 
    try {
      const orderId = req.params.id;
  
      // التحقق مما إذا كان حالة الطلب 'done'
      const order = await Order.findById(orderId);
      if (!order || order.StateWork !== 'done') {
        return next(new ApiError(`Order not found or not in 'done' state`, 404));
      }
  
      // إنشاء سجل للطلب المكتمل
      const completedRequest = new Archive({
        orderId: orderId,
        completedBy: req.user._id, // افتراض وجود نظام المصادقة وتوفر معرف المستخدم
        completionDate: new Date(),
      });
  
      // حفظ السجل في جدول الأرشيف
      await completedRequest.save();
  
      // (اختياري) يمكنك إزالة الطلب من جدول الطلبات إذا أردت
      // await Order.findByIdAndRemove(orderId);
  
      res.status(200).json({ accept : completedRequest });
    } catch (error) {
      return next(new ApiError(500, 'Internal Server Error'));
    }
});
  
