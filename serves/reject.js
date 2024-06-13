/* eslint-disable prefer-destructuring */
const asyncHandler = require('express-async-handler');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp')
const Order = require('../models/orderModel')
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const groups = require('../models/groupUser')
const user = require('../models/userModel')
const socketHandler  = require('../utils/socket');


const {
  rejectOrderMessageHistory,
  rejectWorkMessageHistory,
  rejectConfirmWorkMessageHistory,
  rejectConfirmMessageHistory
} =require('../utils/MessagesHistort')

const {
  rejectOrderMessageSocket,
  rejectWorkMessageSocket,
  rejectConfirmWorkMessageSocket,
  rejectConfirmMessageSocket,
} = require('../utils/MessagesSocket')

const {addToOrderHistory} = require('../middlewares/handleStandardActions')

const { uploadMixOfImages } = require('../middlewares/uploadImage');

exports.uploadOrderImage = uploadMixOfImages([

  {
    name: 'donimgs',
    maxCount: 5,
  },
  // {
  //   name: 'imgDone',
  //   maxCount: 5,
  // },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {

  if (req.files && req.files.donimgs) {
    req.body.donimgs = [];
    await Promise.all(
      req.files.donimgs.map(async (img, index) => {
        const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
  
        await sharp(img.path)
          .resize(1000, 1000)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`uploads/orders/${imageName}`)
            
      
              req.body.donimgs.push(imageName) ;

      })
    );
  }
//   if (req.files && req.files.donimgs) {
//     req.body.imgDone = []; 
//     await Promise.all(
//         req.files.donimgs.map(async (img, index) => {
//             const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

//             await sharp(img.path)
//                 .resize(1000, 1000)
//                 .toFormat('jpeg')
//                 .jpeg({ quality: 90 })
//                 .toFile(`uploads/orders/${imageName}`, (err) => {
//                     if (err) {
//                         console.error('Error saving image:', err);
//                     } else {
//                         req.body.imgDone.push(imageName);
//                     }
//                 });
//         })
//     );
// }
try {
  const files = await fs.readdir('uploads/test');
  // Iterate through files and delete them
  await Promise.all(files.map(async (file) => {
    await fs.unlink(`uploads/test/${file}`);
    // console.log(`File ${file} deleted successfully.`);
  }));
  // console.log('Contents of "uploads/test" directory deleted successfully.');
} catch (err) {
  // console.error('Error deleting contents of "uploads/test" directory:', err);
}
  next();
});

exports.getRejectedOrders = asyncHandler(async (req, res) => {

  // const filter = { State: 'reject', groups: req.user.group };
  //   // Build query
  //   const documentsCounts = await Order.countDocuments();
  //   const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
  //     .paginate(documentsCounts)
  //     .filter()
  //     .search(Order)
  //     .limitFields()
  //     .sort();

  //   // Execute query
  //   const { mongooseQuery, paginationResult } = apiFeatures;
  //   const documents = await mongooseQuery;

  //   res
  //     .status(200)
  //     .json({ results: documents.length, paginationResult, data: documents });
  });

exports.getRejectedWorks = asyncHandler(async (req, res) => {

  // const filter = { StateWork: 'reject', groups: req.user.group };
  //   // Build query
  //   const documentsCounts = await Order.countDocuments();
  //   const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
  //     .paginate(documentsCounts)
  //     .filter()
  //     .search(Order)
  //     .limitFields()
  //     .sort();

  //   // Execute query
  //   const { mongooseQuery, paginationResult } = apiFeatures;
  //   const documents = await mongooseQuery;

  //   res
  //     .status(200)
  //     .json({ results: documents.length, paginationResult, data: documents });
  });

exports.getRejectedDone = asyncHandler(async (req, res) => {

  // const filter = { StateDone: 'reject', groups: req.user.group };
  //   // Build query
    // const documentsCounts = await Order.countDocuments();
    // const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
    //   .paginate(documentsCounts)
    //   .filter()
    //   .search(Order)
    //   .limitFields()
    //   .sort();

    // // Execute query
    // const { mongooseQuery, paginationResult } = apiFeatures;
    // const documents = await mongooseQuery;

    // res
    //   .status(200)
    //   .json({ results: documents.length, paginationResult, data: documents });
  });

// exports.getAllRejected = asyncHandler(async (req, res) => {
//   const loggedInUserId = req.user._id;

//   // let filter = {};
//   // if (req.filter) {
    
//   //   filter = req.filter;
//   // }

//   const userGroup = await user.findOne({ _id: loggedInUserId });
//   const userGroupLevel = userGroup.group.level;
//   const userGroupInLevel = userGroup.group.inlevel;
  
//   const similarGroups = await groups.find({ level: userGroupLevel, inlevel: userGroupInLevel });


//   const groupIds = similarGroups.map(group => group._id);

//   const groupFilter = {
//     groups: {
//       $in: groupIds ,
//     }
//   };
//   const filter = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], group: req.user.group };

//     const documentsCounts = await Order.countDocuments();
//     const loggedInUserIdString = loggedInUserId.toString();
//     const acceptedOrdersFilter = {
//       $or: [
//         { createdBy: { $ne :loggedInUserId }},
//         {
//           $and: [
//             { State: 'reject' },
//             { StateWork: 'reject' },
//             { StateDone: 'reject' }
//           ]
//         }
//       ],
//       archive: { $ne: true }
//     }

//     const apiFeatures = new ApiFeatures(Order.find({$or: [{ ...groupFilter }, { usersOnprase: loggedInUserId }],$and :[{...acceptedOrdersFilter}], ...filter}), req.query)
//       .paginate(documentsCounts)
//       .filter()
//       .search(Order)
//       .limitFields()
//       // .sort();

//     // Execute query
//     const { mongooseQuery, paginationResult } = apiFeatures;
//     const documents = await mongooseQuery;

//     res
//       .status(200)
//       .json({ results: documents.length, paginationResult, order: documents });
//   });

exports.getUserOrders = asyncHandler(async (req, res, next) => {
  try {
    // استخدام معرّف المستخدم من req.user
    const userId = req.user._id;

    // البحث عن الطلبات التي يكون معرّف المستخدم في حقل users
    const userOrders = await Order.find({ 'users': userId });

    // إرسال النتائج إلى العميل
    res.status(200).json({ data: userOrders });
  } catch (error) {
    // في حالة وجود أي خطأ، يتم إرسال استجابة خطأ إلى العميل
    console.error('Error in getUserOrders:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.rejectOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectOrder) {
    return next(new ApiError('Unauthorized to reject orders' ,403));
  }

    const updatedOrder = await Order.findById(orderId);

    if (!updatedOrder) {
      return next(new ApiError(`No order found for this id`, 404));
    }
  updatedOrder.senderOrderId = req.user.group._id
    updatedOrder.State = 'reject';
    updatedOrder.StateReasonReject = reason;


    addToOrderHistory(updatedOrder,loggedInUserId,rejectOrderMessageHistory,reason)

    // updatedOrder.history.push({
    //   editedAt: Date.now(),
    //   editedBy: loggedInUserId,
    //   action: rejectOrderMessageHistory,
    //   reason: reason
    // });
    if (updatedOrder.State === 'reject'){
      const lastGroup = updatedOrder.groups[updatedOrder.groups.length - 1]
      updatedOrder.group = lastGroup ;
      updatedOrder.groups.pop();
    }else{
      const lastGroup = updatedOrder.groups[updatedOrder.groups.length -1]
      updatedOrder.group = lastGroup ;
    }
    // updatedOrder.usersGroup = updatedOrder.users.group._id ;
    updatedOrder.updatedAt =Date.now()
    await updatedOrder.save();

    const updatOrder = await Order.findById(updatedOrder._id);

    const roomgroup = updatOrder.group.name;

    let page;
    if (updatOrder.createdBy.group.toString() === updatOrder.group._id.toString()) {
        page = 'reject';
    } else {
        page = 'onprase';
    }
    const message = rejectOrderMessageSocket(updatOrder,page)
    console.log (message)
  //   const message = {
  //   type: "order_update",
  //   title: "رفض الطلب",
  //   body : `تم رفض الطلب من قبل ${req.user.group.name}`,
  //   action: "open_page",
  //   page : page,
  //   orderID: updatOrder._id,
  //   time : updatOrder.updatedAt
  // }
    socketHandler.sendNotificationToRoom(roomgroup,message,);

    res.status(200).json({ order : updatedOrder });
});

exports.rejectWork = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectWork) {
    return next(new ApiError('Unauthorized to reject work' ,403));
  }

    const updatedOrder = await Order.findById(orderId);

    if (!updatedOrder) {
      return next(new ApiError(`No order found for this id`, 404));
    }
    if (updatedOrder.State !== 'accept' ) {
      return next(new ApiError(`you should be access your work first `, 404));
    }
    updatedOrder.StateWork = 'reject';
    updatedOrder.StateWorkReasonReject = reason;

    addToOrderHistory(updatedOrder,loggedInUserId,rejectWorkMessageHistory,reason)


    // updatedOrder.history.push({
    //   editedAt: Date.now(),
    //   editedBy: loggedInUserId,
    //   action: rejectWorkMessageHistory,
    //   reason: reason
    // });
    
      updatedOrder.usersOnprase.pop();
      const lastGroup = updatedOrder.usersOnprase[updatedOrder.usersOnprase.length - 1]
      updatedOrder.users = lastGroup ;
      if (!updatedOrder.users){
        return next(new ApiError(`No order found for this id`, 404));
      }
 updatedOrder.senderOrderId = req.user.group._id
      updatedOrder.usersGroup = updatedOrder.users.group._id ;
    updatedOrder.updatedAt =Date.now()
    await updatedOrder.save();

  const updatOrder = await Order.findById(updatedOrder._id).populate('users');

  const roomUser = updatOrder.users.userId;
  let page;
  if (updatOrder.createdBy.group === updatOrder.users.group._id) {
      page = 'reject';
  } else {
      page = 'onprase';
  }
    const message = rejectWorkMessageSocket(updatOrder,page)
    console.log (message)
//   const message = {
//   type: "order_update",
//   title: "رفض الطلب",
//   body : `تم رفض الطلب من قبل ${req.user.group.name}`,
//   action: "open_page",
//   page : page,
//   orderID: updatOrder._id,
//   time : updatOrder.updatedAt
// }

  socketHandler.sendNotificationToUser(roomUser,message);

    res.status(200).json({ order :updatedOrder });
});

exports.rejectConfirmWork = asyncHandler(async (req,res , next) => {

  const orderId = req.params.id;

  const loggedInUserId = req.user._id;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectOrder) {
    return next(new ApiError('Unauthorized to reject orders' ,403));
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId);

  if (!updatedOrder) {
    return next(new ApiError(`No order found for this id`, 404));
  }
  if (updatedOrder.StateWork !== 'endwork' ) {
  return next(new ApiError(`you should be end the work first `, 404));
  }
 updatedOrder.senderOrderId = req.user.group._id
  updatedOrder.donimgs = []
  updatedOrder.StateWork = 'reject';
  updatedOrder.StateWorkReasonReject = reason;

  updatedOrder.users = updatedOrder.usersOnprase[updatedOrder.usersOnprase.length -1]

  addToOrderHistory(updatedOrder,loggedInUserId,rejectConfirmWorkMessageHistory,reason)


  // updatedOrder.history.push({
  //   editedAt: Date.now(),
  //   editedBy: loggedInUserId,
  //   action: rejectConfirmWorkMessageHistory,
  //   reason: reason
  // });

  updatedOrder.usersGroup = updatedOrder.users.group._id ;
  updatedOrder.updatedAt =Date.now()
  await updatedOrder.save();

  const updatOrder = await Order.findById(updatedOrder._id).populate('users');

  const roomUser = updatOrder.users.userId;
  let page;
  if (updatOrder.createdBy.group.toString() === updatOrder.users.group._id.toString()) {
      page = 'reject';
  } else {
      page = 'onprase';
  }
    const message = rejectConfirmWorkMessageSocket(updatOrder,page)
    console.log (message)
//   const message = {
//   type: "order_update",
//   title: "تاكيد الطلب",
//   body : `تم رفض التاكيد على الطلب من قبل ${req.user.group.name}`,
//   action: "open_page",
//   page : page,
//   orderID: updatOrder._id,
//   time : updatOrder.updatedAt
// }

  socketHandler.sendNotificationToUser(roomUser,message);

  res.status(200).json({ order : updatedOrder });

})

exports.rejectConfirm = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectWork) {
    return next(new ApiError('Unauthorized to reject work' ,403));
  }
    // العثور على الطلب وتحديث حالته
    const updatedOrder =  await Order
    .findByIdAndUpdate(orderId, { ...req.body}, { new: true })
    .populate('donimgs');

    if (!updatedOrder) {
      return next(new ApiError(`No order found for this id`, 404));
    }
    if (updatedOrder.StateWork !== 'confirmWork' ) {
      return next(new ApiError(`you should be confirm your work`, 404));
    }
    updatedOrder.StateWork = 'onprase';
    updatedOrder.StateDone = 'reject';
    updatedOrder.StateDoneReasonReject = reason;

    addToOrderHistory(updatedOrder,loggedInUserId,rejectConfirmMessageHistory,reason)


    // إضافة معلومات السجل
    // updatedOrder.history.push({
    //   editedAt: Date.now(),
    //   editedBy: loggedInUserId,
    //   action: rejectConfirmMessageHistory,
    //   reason: reason
    // });
 updatedOrder.senderOrderId = req.user.group._id
    const lastGroup = updatedOrder.usersOnprase[updatedOrder.usersOnprase.length -3]
    updatedOrder.users = lastGroup;
    updatedOrder.usersGroup = updatedOrder.users.group._id ;
    updatedOrder.updatedAt =Date.now()
    await updatedOrder.save();

    const updatOrder = await Order.findById(updatedOrder._id).populate('users','createdBy');

    const roomUser = updatOrder.users.userId;
    console.log(roomUser)
    let page;
     if (updatOrder.createdBy.group.toString() === updatOrder.group) {
        page = 'reject';
    } else {
        page = 'onprase';
    }
    const message = rejectConfirmMessageSocket(updatOrder,page)
    console.log (message)
  //   const message = {
  //   type: "order_update",
  //   title: "تاكيد الطلب",
  //   body : `تم رفض التاكيد على الطلب من قبل ${req.user.group.name}`,
  //   action: "open_page",
  //   page : page,
  //   orderID: updatOrder._id,
  //   time : updatOrder.updatedAt
  // }

    socketHandler.sendNotificationToUser(roomUser,message);

    res.status(200).json({ order:updatedOrder });
});

exports.archiveReject = asyncHandler(async (req, res, next) => {

    const orderId = req.params.id;


    const updatedOrder = await Order.findById(orderId);

    if (!updatedOrder) {
      return next(new ApiError(404, 'Order not found'));
    }
    updatedOrder.archive = true;
    updatedOrder.updatedAt =Date.now()
    updatedOrder.save()
    
    res.status(200).json({ order : updatedOrder });
});
