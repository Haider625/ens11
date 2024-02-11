const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const ApiError = require('../utils/apiError');

// exports.reject = asyncHandler(async (req, res, next) => {
//     const loggedInUserId = req.user._id;
//     const { orderId ,reason } = req.body;
//     const newGroupId = req.params._id;
  
//     if (!req.user.Permission.canRejectOrder) {
//         return next(new ApiError('You do not have permission to Reject this order', 403));
//       }
  
//     const order = await Order.findById(
//       orderId);
  
//     if (!order) {
//       throw new ApiError('الطلب غير موجود', 404);
//     }
  
//     // التحقق مما إذا كان الكروب موجود بالفعل في الطلب
//     const isGroupExistsInOrder = order.group.some(groupId => groupId.equals(newGroupId));
  
//     if (isGroupExistsInOrder) {
//       return res.status(400).json({ message: 'الكروب موجود بالفعل في الطلب' });
//     }
//     order.history.push({
//         editedAt: Date.now(),
//         editedBy: loggedInUserId,
//         action: `تم رفض الطلب و تحويلها من قبل :${loggedInUserId}`,
//         reason : reason
//       });
//     // إضافة الكروب الجديد إلى حقل "groups" في الطلب
//     order.group.push(newGroupId);
//     order.State = 'reject';
//     order.StateReasonReject = reason
//     // حفظ التغييرات في الطلب
//     await order.save();
  
//     return res.status(200).json({ order });
//   });

// exports.getRejects = asyncHandler(async (req, res, next) => {
//     const userId = req.user._id;

//     // العثور على المستخدم باستخدام findById
//     const userObject = await User.findById(userId).populate('forwordRejects');

//     // البيانات المطلوبة موجودة الآن في forwordRejects
//     const {forwordRejects} = userObject;

//     res.status(200).json({ forwordRejects });
// });

// exports.accept = asyncHandler(async (req, res, next) => {
//     const loggedInUserId = req.user._id;
//     const { orderId ,reason } = req.body;
//     const newGroupId = req.params._id;
  
//     if (!req.user.Permission.canAcceptOrder) {
//         return next(new ApiError('You do not have permission to accept this order', 403));
//       }
  
//     const order = await Order.findById(orderId);
  
//     if (!order) {
//       throw new ApiError('الطلب غير موجود', 404);
//     }
  
//     // التحقق مما إذا كان الكروب موجود بالفعل في الطلب
//     const isGroupExistsInOrder = order.group.some(groupId => groupId.equals(newGroupId));
  
//     if (isGroupExistsInOrder) {
//       return res.status(400).json({ message: 'الكروب موجود بالفعل في الطلب' });
//     }
//     order.history.push({
//         editedAt: Date.now(),
//         editedBy: loggedInUserId,
//         action: `تم قبول الطلب و تحويلها من قبل :${loggedInUserId}`,
//         reason : reason
//       });
//     // إضافة الكروب الجديد إلى حقل "groups" في الطلب
//     order.group.push(newGroupId);
//     order.State = 'accept';
//     order.StateReasonAccept = reason
//     // حفظ التغييرات في الطلب
//     await order.save();
  
//     return res.status(200).json({ order });
// })

// exports.getAccepts =  asyncHandler(async (req, res, next) => {
//     const userId = req.user._id;

//     // العثور على المستخدم باستخدام findById
//     const userObject = await User.findById(userId).populate('forwordAccepts');

//     // البيانات المطلوبة موجودة الآن في forwordAccepts
//     const {forwordAccepts} = userObject;

//     res.status(200).json({ forwordAccepts });
//       });

exports.forwordOrder = asyncHandler(async(req, res, next) => {
  const loggedInUserId = req.user._id;
  const loggedUser = req.user
  const { groupIds, reason } = req.body;
  const {orderId} = req.params;
  if (!req.user.Permission.canForword) {
      return next(new ApiError('You do not have permission to Forword this order', 403));
  }

  // التحقق من وجود الطلب باستخدام findById
  const order = await Order.findById(orderId);
  
  if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
  }

  // التحقق مما إذا كانت الكروب موجودة بالفعل في الطلب
  const isGroupExistsInOrder = order.group.groupIds
  if (isGroupExistsInOrder) {
      return res.status(400).json({ message: 'الكروب موجود بالفعل في الطلب' });
  }

  order.history.push({
      editedAt: Date.now(),
      editedBy: loggedInUserId,
      action: `تم تحويل الطلب بواسطة: ${loggedInUserId}`,
      reason: reason
  });

  // قم بتعيين group بقيمة الـ groupIds
  order.group = groupIds;

// (اختياري) إذا كان لديك حقل يسمى loggedInUserId.group في مستخدمك، قد ترغب في تعيينه أيضًا
if (order.groups === null || order.groups === undefined) {
  order.groups = [loggedUser.group];
} else {
  order.groups.push(loggedUser.group);
}


  // تعيين السبب للحالة عند المعالجة
  order.State = 'onprase';
  order.StateReasonOnprase = reason;

  // حفظ التغييرات في الطلب
  await order.save();

  return res.status(200).json({ order });
})

// هذه الدالة تقوم بجلب الكروبات العلى من المستخدم و الذي في مستواه حسب صلاحيات الكروب الذي سجل فيه 
exports.forwordOrdersUp = asyncHandler(async(req, res, next) => {

  const userId = req.user._id;

  // العثور على المستخدم باستخدام findById
  const userObject = await User.findById(userId);

      const { forwordGroup, levelSend } = userObject.group;

      const {forwordOrdersUp} = userObject

      res.status(200).json({ forwordGroup, levelSend ,forwordOrdersUp});
})

exports.forwordWorkDown = asyncHandler(async(req, res, next) => {

  const userId = req.user._id;

  // العثور على المستخدم باستخدام findById
  const userObject = await User.findById(userId);

      const { forwordGroup, levelsReceive } = userObject.group;

      const {forwordWorkDown} = userObject

      res.status(200).json({ forwordGroup, levelsReceive ,forwordWorkDown });
})


// دالة لازالة العناصر المكررة 
// exports.forwordWorkDown = asyncHandler(async(req, res, next) => {
//   const userId = req.user._id;

//   // العثور على المستخدم باستخدام findById
//   const userObject = await User.findById(userId);

//   const { group, forwordWorkDown } = userObject;

//   const {forwordGroup} = group;
//   const {levelsReceive} = group;

//   // إزالة العناصر المكررة بين forwordGroup و levelsReceive
//   const filteredForwordGroup = forwordGroup.filter(item => !levelsReceive.includes(item));

//   res.status(200).json({ forwordGroup: filteredForwordGroup, levelsReceive, forwordWorkDown });
// });
