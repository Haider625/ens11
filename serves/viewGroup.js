const asyncHandler = require('express-async-handler');

const order = require('../models/orderModel')
const groups = require('../models/groupUser')
const User = require('../models/userModel')
const ApiError = require('../utils/apiError');

exports.getOrdersByGroup = async (req, res, next) => {
    try {
      const {groupId} = req.params; // افترض أنه يتم إرسال معرّف الكروب عبر معرف الطلب
  
      // التحقق من وجود الكروب
      const group = await groups.findById(groupId);
  
      if (!group) {
        return next(new ApiError('Group not found', 404));
      }
  
      // التحقق من صلاحية المستخدم للوصول إلى طلبات هذا الكروب
      if (!req.user.Permission.canViwGroupsViw) {
        return next(new ApiError('Permission denied', 403));
      }
  
      // جلب الطلبات التابعة للكروب المحدد
      const orders = await order.find({ group: groupId }).populate('createdBy', 'name userId');
  
      res.status(200).json({ orders });
    } catch (error) {
      next(error);
    }
  };
exports.getGroupscanViwGroups = asyncHandler(async (req, res, next) => {
    try {
      // تأكيد وجود userId في طلب الوارد
      const userId = req.user._id;
  
      // البحث عن المستخدم باستخدام userId
      const user = await User.findOne({ _id: userId });
  
      // التحقق مما إذا كان المستخدم موجودًا
      if (user) {
        // جلب بيانات GroupscanViw للمستخدم
        const groupscanViwData = await user.getGroupscanViwData();
  
        res.status(200).json({ success: true, data: groupscanViwData });
      } else {
        // إذا لم يتم العثور على المستخدم
        return next(new ApiError(404, 'User not found'));
      }
    } catch (error) {
      console.error('Error in getGroupscanViwGroups:', error);
      return next(new ApiError(500, 'Internal Server Error'));
    }
  });
  
