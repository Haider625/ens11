const asyncHandler = require('express-async-handler');
const orders = require('../models/orderModel');
const User = require('../models/userModel');
const groups = require('../models/groupUser');
const ApiError = require('../utils/apiError');
const Archive = require('../models/archive')

exports.acceptOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id; // افتراض وجود نظام المصادقة وتوفر معرف المستخدم

  const {users} = req.body;
 
  if (!req.user.Permission.canAcceptOrder) {
    return res.status(403).json({ message: 'Permission denied' });
  }
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await orders.findByIdAndUpdate(
    orderId,
    { State: 'accept', users : users },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId ,
  action : `تم قبول طلبك من قبل ${loggedInUserId}`
});

await updatedOrder.save();

  res.status(200).json({ updatedOrder });
});

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
  const usersInGroup = await User.find({ group: user.group });

  return res.status(200).json({ usersInGroup });
});

exports.getUserOrders = asyncHandler(async (req, res, next) => {
  try {
    // استخدام معرّف المستخدم من req.user
    const userId = req.user._id;

    // البحث عن الطلبات التي يكون معرّف المستخدم في حقل users
    const userOrders = await orders.find({ 'users': userId });

    // إرسال النتائج إلى العميل
    res.status(200).json({ data: userOrders });
  } catch (error) {
    // في حالة وجود أي خطأ، يتم إرسال استجابة خطأ إلى العميل
    console.error('Error in getUserOrders:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.acceptwork = asyncHandler(async(req,res,next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول

  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await orders.findByIdAndUpdate(
    orderId,
    { StateWork: 'acceptwork'},
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
 action : `تم قبول العمل على طلبك من قبل ${loggedInUserId}`
});

await updatedOrder.save();
  
  res.status(200).json({ updatedOrder });
});

exports.startWork = asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const orderId = req.params.id;
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await orders.findByIdAndUpdate(
    orderId,
    { StateWork: 'startwork'},
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
 action : `تم بدء العمل على طلبك من قبل ${loggedInUserId}`
});

await updatedOrder.save();
  
  res.status(200).json({ updatedOrder });
});

exports.endWork = asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const orderId = req.params.id;
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await orders.findByIdAndUpdate(
    orderId,req.body,
    { StateWork: 'endwork'},
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
 action : `تم بدء العمل على طلبك من قبل ${loggedInUserId}`
});

await updatedOrder.save();
  
  res.status(200).json({ updatedOrder });
await updatedOrder.save();
  
  res.status(200).json({ updatedOrder });
});

exports.confirmWorkCompletion = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const orderId = req.params.id; // معرّف الطلب
  
  // ابحث عن الطلب المراد تغيير حالته
  const order = await orders.findById(orderId);

  if (!order) {
    return next(new ApiError(`No order found for this id`, 404));
  }

  // تحقق من أن المستخدم الحالي هو من رفع الطلب
  if (order.user.toString() !== loggedInUserId.toString()) {
    return next(new ApiError(`You are not allowed to confirm work completion for this order`, 403));
  }

  // قم بتحديث حالة الطلب إلى 'done'
  order.State = 'done';

  // إضافة سجل جديد إلى سجل التحديثات
  order.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: 'تم تاكيد انهاء العمل على الطلب', 
  });

  // حفظ التغييرات
  await order.save();

  res.status(200).json({ order });
});

exports.AcceptArchive = asyncHandler(async (req, res, next) => {
 
    try {
      const orderId = req.params.id;
  
      // التحقق مما إذا كان حالة الطلب 'done'
      const order = await orders.findById(orderId);
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
  
      res.status(200).json({ success: true, data: completedRequest });
    } catch (error) {
      console.error('Error in archiveOrderOnDone:', error);
      return next(new ApiError(500, 'Internal Server Error'));
    }
});
  
