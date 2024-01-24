const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const ApiError = require('../utils/apiError');

exports.reject = asyncHandler(async (req, res, next) => {
  const {newGroupId } = req.body;
  const orderId = req.params._id;

  if (!newGroupId || !orderId) {
    throw new ApiError('يجب توفير معرف المستخدم ومعرف الكروب الجديد ومعرف الطلب', 400);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError('الطلب غير موجود', 404);
  }

  // التحقق مما إذا كان الكروب موجود بالفعل في الطلب
  const isGroupExistsInOrder = order.group.some(groupId => groupId.equals(newGroupId));

  if (!isGroupExistsInOrder) {
    // إضافة الكروب الجديد إلى حقل "groups" في الطلب
    order.group.push(newGroupId);

    // حفظ التغييرات في الطلب
    await order.save();

    return res.status(200).json({ message: 'تمت إضافة الكروب إلى الطلب بنجاح' });
  } 

  throw new ApiError('الكروب موجود بالفعل في الطلب', 400);
});

exports.getRejects = asyncHandler(async (req, res, next) => {
        // العثور على المستخدمين في الكروب باستخدام populate
        const forwordRejects = await User.find('forwordRejects').populate('forwordRejects');
      
        res.status(200).json({ forwordRejects });
      });

exports.accept = asyncHandler(async (req, res, next) => {
        const orderId = req.params._id
        const { newGroupId,  } = req.body;
      
        if (!newGroupId || !orderId) {
          throw new ApiError('يجب توفير معرف المستخدم ومعرف الكروب الجديد ومعرف الطلب', 400);
        }
        const order = await Order.findById(orderId);
      
        if (!order) {
          throw new ApiError('الطلب غير موجود', 404);
        }

        // إضافة الكروب الجديد إلى حقل "groups" في الطلب
        order.group.push(newGroupId);
        // حفظ التغييرات في المستخدم والطلب
        await order.save();

        res.status(200).json({ message: 'تمت إضافة الكروب إلى الطلب والمستخدم بنجاح' });
})

exports.getAccepts =  asyncHandler(async (req, res, next) => {
        // العثور على المستخدمين في الكروب باستخدام populate
        const forwordAccepts = await User.find('forwordAccepts').populate('forwordAccepts');
      
        res.status(200).json({ forwordAccepts });
      });

exports.order = asyncHandler(async(req,res,next) => {
    const orderId = req.params._id
    const { newGroupId,  } = req.body;
  
    if (!newGroupId || !orderId) {
      throw new ApiError('يجب توفير معرف المستخدم ومعرف الكروب الجديد ومعرف الطلب', 400);
    }
    const order = await Order.findById(orderId);
  
    if (!order) {
      throw new ApiError('الطلب غير موجود', 404);
    }

    // إضافة الكروب الجديد إلى حقل "groups" في الطلب
    order.group.push(newGroupId);
    // حفظ التغييرات في المستخدم والطلب
    await order.save();

    res.status(200).json({ message: 'تمت إضافة الكروب إلى الطلب والمستخدم بنجاح' });
    
})

exports.getOrders = asyncHandler(async(req,res,next) =>{
    
    const forwordOrders = await User.find('forwordOrders').populate('forwordOrders');
      
        res.status(200).json({ forwordOrders });
})