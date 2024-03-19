const asyncHandler = require('express-async-handler');

const order = require('../models/orderModel')
const groups = require('../models/groupUser')
const User = require('../models/userModel')
const ApiError = require('../utils/apiError');

exports.getOrdersByGroup = async (req, res, next) => {
    try {
      const {groupId} = req.params;
  
      const group = await groups.findById(groupId);
  
      if (!group) {
        return next(new ApiError('Group not found', 404));
      }
  
      if (!req.user.Permission.canViwGroupsViw) {
        return next(new ApiError('Permission denied', 403));
      }
  
      const orders = await order.find({ group: groupId }).populate('createdBy', 'name userId');
  
      res.status(200).json({ orders });
    } catch (error) {
      next(error);
    }
  };
exports.getGroupscanViwGroups = asyncHandler(async (req, res, next) => {

      const userId = req.user._id;
      const user = await User.findById(userId).populate('GroupscanViw');

      if (user) {
        const groupscanViwData = user.GroupscanViw;
  
        res.status(200).json({ group : groupscanViwData });
      } else {

        return next(new ApiError(404, 'User not found'));
      }

  });
  
