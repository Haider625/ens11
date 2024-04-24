const asyncHandler = require('express-async-handler');

const Order = require('../models/orderModel')
const groups = require('../models/groupUser')
const User = require('../models/userModel')
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures')

exports.getOrdersByGroup =asyncHandler( async (req, res, next) => {
      const {groupId} = req.params;


      if (!req.user.Permission.canViwGroupsViw) {
        return next(new ApiError('Permission denied', 403));
      }

      let filter = {};
      if (req.filterObj) {
        filter = req.filterObj;
      }

      const documentsCounts = await Order.countDocuments();
      const apiFeatures = new ApiFeatures(
        Order.find({
          $or: [
            { group: groupId }, 
            { usersGroup: groupId } 
          ]
        },filter),req.query)
        .paginate(documentsCounts)
        .search('Order')
        .limitFields()
        .sort();
      
      const { mongooseQuery, paginationResult } = apiFeatures;
      const documents = await mongooseQuery;

      res
        .status(200)
        .json({ results: documents.length, paginationResult, orders: documents });
    
});
exports.getGroupscanViwGroups = asyncHandler(async (req, res, next) => {

      const userId = req.user._id;
      const user = await User.findById(userId).populate('GroupscanViw');


        const groupscanViwData = user.GroupscanViw;
  
        res.status(200).json({ group : groupscanViwData });
  });
  
