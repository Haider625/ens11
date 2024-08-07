const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const ApiError = require('../utils/apiError');
const socketHandler  = require('../utils/socket');
const {forwordMessageSocket} =require('../utils/MessagesSocket')
const {forwordMessageHistory} = require('../utils/MessagesHistort')
const {addToOrderHistory , calculateTimeDifference , setOrderDetails} = require('../middlewares/handleStandardActions')

exports.forwordOrder = asyncHandler(async(req, res, next) => {
  const loggedInUserId = req.user._id;
  const loggedUser = req.user
  const { groupIds, reason } = req.body;
  const {orderId} = req.params;
  if (!req.user.Permission.canForword) {
      return next(new ApiError('You do not have permission to Forword this order', 403));
  }

  const order = await Order.findById(orderId).populate({
    path: 'group',
    select: 'name', 
  });
  
  if (!order ) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
  }

  const isGroupExistsInOrder = order.group.groupIds
  if (isGroupExistsInOrder) {
      return res.status(400).json({ message: 'الكروب موجود بالفعل في الطلب' });
  }

const timeDifference =calculateTimeDifference(order.history)

  addToOrderHistory(
    order,
    loggedInUserId,
    forwordMessageHistory,
    reason,
    timeDifference.days,
    timeDifference.hours,
    timeDifference.minutes,
    timeDifference.seconds
    
  )

  if (!order.groups.some(group => group._id.equals(loggedUser.group._id))) {
    order.groups.push(loggedUser.group);
  }
   setOrderDetails(order,req.user)
  
  order.group = groupIds;
  order.State = 'forword';

  order.TimeReceive = Date.now();
  await order.save();
  const updatOrder = await Order.findById(order._id).populate('group');

  const roomgroup = updatOrder.group.name;

  const message = forwordMessageSocket(updatOrder)
// const message = {
//   type: "order_update",
//   title: "طلب جديد",
//   body : `تم وصول طلب جديد من قبل ${req.user.group.name}`,
//   action: "open_page",
//   page : "onprase",
//   orderID: updatOrder._id,
//   time : updatOrder.updatedAt
// }

// console.log(message)

socketHandler.sendNotificationToRoom(roomgroup,message);

  return res.status(200).json({order: updatOrder });
})

exports.forwordOrdersUp = asyncHandler(async(req, res, next) => {

  const userId = req.user._id;

  // العثور على المستخدم باستخدام findById
  const userObject = await User.findById(userId);

      const { forwordGroup, levelSend } = userObject.group;

      const {forwordOrdersUp} = userObject;

      const mergedData = [...forwordGroup,levelSend, ...forwordOrdersUp];

      res.status(200).json({groups : mergedData });
})

exports.forwordWorkDown = asyncHandler(async(req, res, next) => {

  const userId = req.user._id;

  // العثور على المستخدم باستخدام findById
  const userObject = await User.findById(userId);

      const { forwordGroup, levelsReceive } = userObject.group;

      const {forwordWorkDown} = userObject;

      const mergedData = [...forwordGroup, ...levelsReceive, ...forwordWorkDown];

      res.status(200).json({groups :mergedData});
})
