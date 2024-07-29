/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-syntax */
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
    const loggedInUserIdString = loggedInUserId.toString();
    const acceptedOrdersFilter = {
    $or: [
      {
        $and: [
          { createdBy: loggedInUserIdString },
          { State: { $ne: 'reject' } },
          { StateWork: { $ne: 'reject' } }
        ]
      },
      {
        createdBy: { $ne: loggedInUserIdString }
      }
    ],
    archive: { $ne: true }
  }
    return acceptedOrdersFilter;
};

exports.OnpraseOrdersFilter = (loggedInUserId) => {

  const loggedInUserIdString = loggedInUserId.toString();
  const acceptedOrdersFilter = {
    $or: [
      { createdBy: { $ne: loggedInUserIdString }},
      {
        $or: [
          { State: { $ne: 'reject' } },
          { StateWork: { $ne: 'reject' } },
        ]
       }
    ],
  archive: { $ne: true }
}
  return acceptedOrdersFilter
};

exports.rejectsOrderFilter = (loggedInUserId, req) => {

    const acceptedOrdersFilters = {
      $and: [
        { createdBy: loggedInUserId },
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

    return { ...acceptedOrdersFilters};
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

// exports.paginateAggregate = (req, documentsCounts, aggregatePipeline) => {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 15;
//     const skip = (page - 1) * limit;
//     const endIndex = page * limit;

//     // Push pagination steps into the aggregation pipeline
//     aggregatePipeline.push(
//         { $skip: skip },
//         { $limit: limit }
//     );

//     // Define pagination object
//     const pagination = {
//         currentPage: page,
//         limit: limit,
//         numberOfPages: Math.ceil(documentsCounts / limit)
//     };

//     // Set next page if applicable
//     if (endIndex < documentsCounts) {
//         pagination.next = page + 1;
//     }

//     // Set previous page if applicable
//     if (skip > 0) {
//         pagination.prev = page - 1;
//     }

//     return pagination;
// };

// exports.searchAggregate = (queryString, modelName, aggregateQuery) => {
//     if (!modelName || !queryString.keyword) {
//         return aggregateQuery;
//     }

//     let query = {};

//     const {keyword} = queryString;
//     const keywordRegex = new RegExp(keyword, 'i');

//     if (modelName === 'Order') {
//         query.$or = [
//             { type1: { $regex: keywordRegex } },
//             { type2: { $regex: keywordRegex } },
//             { type3: { $regex: keywordRegex } },
//             { caption: { $regex: keywordRegex } },
//         ];
//     } else {
//         query = { name: { $regex: keywordRegex } };
//     }

//     aggregateQuery.push({ $match: query });

//     return aggregateQuery;
// }

// exports.filterAggregate = (req , aggregatePipeline) => {
//     const queryStringObj = { ...req.query };

//     const excludesFields = ['page', 'sort', 'keyword', 'order', 'limit', 'fields'];
//     excludesFields.forEach((field) => delete queryStringObj[field]);

//     for (const key in queryStringObj) {
//         if (queryStringObj[key] === 'true') {
//             queryStringObj[key] = true;
//         } else if (queryStringObj[key] === 'false') {
//             queryStringObj[key] = false;
//         } else if (!isNaN(queryStringObj[key])) {
//             queryStringObj[key] = Number(queryStringObj[key]);
//         }
//     }

//     let queryStr = JSON.stringify(queryStringObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     const matchStage = { $match: JSON.parse(queryStr) };
    
//     aggregatePipeline.push(matchStage);
// }

// exports.sortAggregate = (req,aggregatePipeline) => {

// if (req.sort) {
//   const sortBy = {};
//   req.sort.split(',').forEach(field => {
//     sortBy[field.startsWith('-') ? field.substring(1) : field] = field.startsWith('-') ? -1 : 1;
//   });
//   aggregatePipeline.push({ $sort: sortBy });
// } else {
//   aggregatePipeline.push({ $sort: { createdAt: -1 } });
// }

// }

// exports.limitFieldAggregate = (req,aggregatePipeline) => {

//     if (req.fields) {
//     const fields = req.fields.split(',').reduce((acc, field) => {
//       acc[field] = 1;
//       return acc;
//     }, {});
//     aggregatePipeline.push({ $project: fields });
//   } else {
//     aggregatePipeline.push({ $project: { __v: 0 } });
//   }
// }

// exports.CountOrders = (req,aggregatePipeline) => {

// const orderCountQuery = req.query.order === 'asc' ? 1 : -1;
// if (orderCountQuery) {
//   aggregatePipeline.push(
//       {
//         $group: {
//           _id: "$senderGroupName",
//           count: { $sum: 1 },
//           totalOrders: { $push: "$$ROOT" }
//         }
//       },
//       { $sort: { count: orderCountQuery } },
//       {
//         $unwind: "$totalOrders" 
//       },
//       { $replaceRoot: { newRoot: "$totalOrders" } }, 
//       { $sort: { orderField: orderCountQuery } }
//   );
// }
// }

// exports.orderDataQuery = async (req,loggedInUserId) => {
 
//   const aggregatePipeline = await this.orderFilter(loggedInUserId)

//   await this.CountOrders(req,aggregatePipeline)

//   await this.searchAggregate(req.query,'Order',aggregatePipeline)

//   await this.filterAggregate(req, aggregatePipeline)

//   await this.sortAggregate(req.query,aggregatePipeline)

//   await this.limitFieldAggregate(req.query,aggregatePipeline)
  
//   return aggregatePipeline
// }

// exports.OnpraseOrderDataQuery = async (req,loggedInUserId) => {


// const aggregatePipeline = await this.onpraseFilter(loggedInUserId)
 
//   await this.CountOrders(req,aggregatePipeline)

//   await this.searchAggregate(req.query,'Order',aggregatePipeline)

//   await this.filterAggregate(req, aggregatePipeline)

//   await this.sortAggregate(req.query,aggregatePipeline)

//   await this.limitFieldAggregate(req.query,aggregatePipeline)
  
//   return aggregatePipeline

// }

// exports.RejectDataQuery = async (req,loggedInUserId) => {
 

// const aggregatePipeline = await this.rejectFilter(loggedInUserId)
 
//   await this.CountOrders(req,aggregatePipeline)

//   await this.searchAggregate(req.query,'Order',aggregatePipeline)

//   await this.filterAggregate(req, aggregatePipeline)

//   await this.sortAggregate(req.query,aggregatePipeline)

//   await this.limitFieldAggregate(req.query,aggregatePipeline)
  
//   return aggregatePipeline


// }

// exports.ArchiveDataQuery = async (req,loggedInUserId) => {


// const aggregatePipeline = await this.ArchiveFilters(loggedInUserId)
 
//   await this.CountOrders(req,aggregatePipeline)

//   await this.searchAggregate(req.query,'Order',aggregatePipeline)

//   await this.filterAggregate(req, aggregatePipeline)

//   await this.sortAggregate(req.query,aggregatePipeline)


//   await this.limitFieldAggregate(req.query,aggregatePipeline)
  
//   return aggregatePipeline



// }

exports.createApiFeatures = (query, reqQuery, documentsCounts,req) => new ApiFeatures(query, reqQuery)
    .search('Order')
    .filter()
    .sort()
    .paginate(documentsCounts)
    .limitFields()

exports.ordersData = async (loggedInUserId) => {
  const groupOrderFilters = await this.groupFilter(loggedInUserId);
  //  const loggedInUserIdString = loggedInUserId.toString();
  const OrdersFilters = await this.OrdersFilter(loggedInUserId)

  const aggregatePipeline = [
  {
    $match: {
      $and: [
        { $or: [{ ...groupOrderFilters }, { users: loggedInUserId }] },
          {$and :[{...OrdersFilters},
        { StateWork: { $ne: 'confirmWork' } },
        { StateWork: { $ne: 'endwork' } },
      ]}
      ],
    }
  },
  ];
  return aggregatePipeline
}

exports.onpraseData = async (loggedInUserId, req) => {
  try {
    const groupOrderFilters = await this.groupsFilter(loggedInUserId);

    const acceptedOrdersFilter = await this.OnpraseOrdersFilter(loggedInUserId)

    const aggregatePipeline = [
      {
        $match: {
          $and: [
            { 
              $or: [
                groupOrderFilters, 
                { usersOnprase: loggedInUserId }
              ] 
            },
            acceptedOrdersFilter,
          ]
        }
      }
    ];

    return aggregatePipeline;
    
  } catch (error) {
    throw new Error(`Error creating aggregate pipeline: ${error.message}`);
  }
};



exports.rejectFilter = async (loggedInUserId,req) => {
  const groupFilters = await this.groupFilter(loggedInUserId);
  
  const acceptedOrdersFilters = await this.rejectsOrderFilter(loggedInUserId,req);

  // const filter =  { 
  //   $or: [{ StateDone: 'reject' },
  //      { State: 'reject' },
  //       { StateWork: 'reject' }
  //     ],
  //      group: req.user.group
  //      };


    // const acceptedOrdersFilters = {
    //   $or: [
    //     { createdBy: { $ne :loggedInUserId }},
    //     {
    //       $and: [
    //         { State: 'reject' },
    //         { StateWork: 'reject' },
    //         { StateDone: 'reject' }
    //       ]
    //     }
    //   ],
    //   archive: { $ne: true }
    // }

const aggregatePipeline = [
  {
    $match: {
      
       $or: [{ ...groupFilters }, { usersOnprase: loggedInUserId }],
       $and :[{...acceptedOrdersFilters}] 
  
  }
  },
];

return aggregatePipeline ;
}

exports.ArchiveFilters = async (loggedInUserId) => {
  const groupOrderFilters = await this.groupFilter(loggedInUserId);

  const groupOnpraseFilters = await this.groupsFilter(loggedInUserId);

  const archiveFilter = await this.ArchiveOrderFilter(loggedInUserId)

const aggregatePipeline = [
  {
    $match: {
    $and: [
      { $or: [{ ...groupOrderFilters },{ ...groupOnpraseFilters }, { usersOnprase: loggedInUserId },{ users: loggedInUserId }] },
      { $and: [{ ...archiveFilter }] }
    ]
    }
  },
];
return aggregatePipeline ;
}

