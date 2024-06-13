
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const groups = require('../models/groupUser');
const user = require('../models/userModel');
const ApiFeatures = require('../utils/apiFeatures');


exports.groupFilter = async (loggedInUserId) => {
    try {
  const userGroup = await user.findOne({ _id: loggedInUserId });
  const userGroupLevel = userGroup.group.level;
  const userGroupInLevel = userGroup.group.inlevel;
  
  const similarGroups = await groups.find({ level: userGroupLevel, inlevel: userGroupInLevel });
  

  const groupIds = similarGroups.map(group => group._id);
  
  const groupFilter = { group: { $in: groupIds } };
      return groupFilter;
    } catch (error) {
        throw new Error(`Error filtering groups: ${error.message}`);
    }
};

exports.groupsFilter = async (loggedInUserId) => {
    try {
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

    return groupsFilter;
    } catch (error) {
        throw new Error(`Error filtering groups: ${error.message}`);
    }
};

exports.OrdersFilter = (loggedInUserId) => {
    // const loggedInUserIdString = loggedInUserId.toString();
    const acceptedOrdersFilter = {
        $or: [
            { createdBy: loggedInUserId },
            {
                $and: [
                    { State: { $ne: 'reject' } },
                    { StateWork: { $ne: 'reject' } },
                    { StateWork: { $ne: 'confirmWork' } },
                    { StateWork: { $ne: 'endwork' } },
                ]
            }
        ],
        archive: { $ne: true }
    };
    return acceptedOrdersFilter;
};

exports.OnpraseOrdersFilter = (loggedInUserId) => {

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
  archive: { $ne: true }
}
  return acceptedOrdersFilter
};

exports.rejectsOrderFilter = (loggedInUserIdString, req) => {
    const filters = {
        $or: [
            { StateDone: 'reject' },
            { State: 'reject' },
            { StateWork: 'reject' }
        ],
        group: req.user.group
    };

    const acceptedOrdersFilters = {
        $and: [
            { createdBy: loggedInUserIdString },
            {
                $or: [
                    { State: 'reject' },
                    { StateWork: 'reject' },
                    { StateDone: 'reject' }
                ]
            }
        ],
        archive: { $ne: true }
    };

    return { ...acceptedOrdersFilters, ...filters };
};

exports.ArchiveOrderFilter = (loggedInUserId) => {
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
  return acceptedOrdersFilter 
}

exports.createApiFeatures = (query, reqQuery, documentsCounts) => new ApiFeatures(query, reqQuery)
    .filter()
    .paginate(documentsCounts)
    .search('Order')
    .limitFields()
    .sort();