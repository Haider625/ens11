/* eslint-disable prefer-destructuring */

const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel')
const groups = require('../models/groupUser')
const user = require('../models/userModel')
const ApiFeatures = require('../utils/apiFeatures')
const ApiError = require('../utils/apiError');

exports.getsArchive = asyncHandler(async (req, res, next) => {

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

  const groupsFilter = {
    groups: {
      $in: groupIds ,
    }
  };
  const groupFilter = {
    group: {
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
    archive: { $ne: false }
  };

  const apiFeatures = new ApiFeatures(Order.find({
    $and: [
      { $or: [{ ...groupFilter },{ ...groupsFilter }, { usersOnprase: loggedInUserId },{ users: loggedInUserId }] },
      { $and: [{ ...acceptedOrdersFilter }, { ...filter }] }
    ]
  }), req.query)
    .paginate(documentsCounts)
    .limitFields()
    .sort()
    .search('Order')

  const { mongooseQuery, paginationResult } = await apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, order: documents });
});
