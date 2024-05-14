const asyncHandler = require('express-async-handler');

const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp')
const fs = require('fs').promises;
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const socketHandler  = require('../utils/socket');

const {
  acceptOrderMessageHistory,
  startWorkMessageHistory,
  endWorkMessageHistory,
  confirmWorkMessageHistory,
  confirmMessageHistory
} = require('../utils/MessagesHistort')

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

  if (req.files.donimgs) {
    req.body.donimgs = [];
    await Promise.all(
      req.files.donimgs.map(async (img, index) => {
        const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
  
        await sharp(img.path)
          .resize(600, 600)
          .toFormat('jpeg')
          .jpeg({ quality: 95 })
          .toFile(`uploads/orders/${imageName}`)
            
      
              req.body.donimgs.push(imageName) ;

      })
    );
  }
  if (req.files && req.files.donimgs) {
    req.body.imgDone = []; 
    await Promise.all(
        req.files.donimgs.map(async (img, index) => {
            const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

            await sharp(img.path)
                .resize(600, 600)
                .toFormat('jpeg')
                .jpeg({ quality: 95 })
                .toFile(`uploads/orders/${imageName}`, (err) => {
                    if (err) {
                        console.error('Error saving image:', err);
                    } else {
                        req.body.imgDone.push(imageName);
                    }
                });
        })
    );
}
try {
  await fs.rm('uploads/test', { recursive: true });
  console.log('Contents of "uploads/test" directory deleted successfully.');
} catch (err) {
  // console.error('Error deleting contents of "uploads/test" directory:', err);
}
  next();
});

exports.getUsersInGroup = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;

  if (!req.user.Permission.canAcceptOrder || !req.user.Permission.canAcceptWork) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const user = await User.findOne({ _id: loggedInUserId });
  
  if (!user || !user.group) {
    return res.status(404).json({ message: 'User not associated with any group' });
  }

  const usersInGroup = await User.find({ group: user.group  },{_id:1,name:1 , group :0,GroupscanViw:0})

  const usersInGroups = await User.find({ group: user.group.levelsReceive },{_id:1,name:1 , group :0,GroupscanViw:0});


  const mergedData  = [...usersInGroup,...usersInGroups]

  return res.status(200).json({ users : mergedData });
});

exports.getUserOrders = asyncHandler(async (req, res, next) => {
  try {

    const userId = req.user._id;
    
    const userOrders = await Order.find({ 'users': userId });

    res.status(200).json({ accept: userOrders });
  } catch (error) {

    console.error('Error in getUserOrders:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.acceptOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id; 
  const {users , reason } = req.body;
 
  if (!req.user.Permission.canAcceptOrder) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { 
        
        StateReasonAccept : reason,
        users : users,
        $addToSet: { usersOnprase: loggedInUserId } 
  },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  
  if(updatedOrder.State === 'accept'){
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId ,
  action : acceptOrderMessageHistory,
  reason : reason
});  
  }else {
    updatedOrder.history.push({
      editedAt: Date.now(),
      editedBy: loggedInUserId ,
      action : acceptOrderMessageHistory,
      reason : reason
    });
  }
  updatedOrder.State = 'accept' 

  updatedOrder.StateWork = 'onprase'

  const existingUserIds = new Set(updatedOrder.usersOnprase.map(user => user._id.toString()));
  const newUser = updatedOrder.users;
  
  if (!existingUserIds.has(newUser._id.toString())) {
    updatedOrder.usersOnprase.push(newUser);
  }
  

updatedOrder.group = null ;
updatedOrder.usersGroup = updatedOrder.users.group._id ;
updatedOrder.updatedAt =Date.now()

await updatedOrder.save();

const updatOrder = await Order.findById(updatedOrder._id).populate('users');

const roomUser = updatOrder.users.userId;

const message = {
  type: "order_update",
  title: "طلب جديد",
  body : `تم وصول طلب جديد من قبل ${req.user.group.name}`,
  action: "open_page",
  page : "home",
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
}
socketHandler.sendNotificationToUser(roomUser,message);

  res.status(200).json({accept : updatOrder });
});

exports.acceptwork = asyncHandler(async(req,res,next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id; 
  const {reason} = req.body

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {   
     
      StateWork: 'acceptwork',
      StateWorkReasonAccept : reason,
      users : loggedInUserId,
      $addToSet: { usersOnprase: req.body.loggedInUserId } 
      
    },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }

updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
 action : `تم قبول العمل من قبل`,
 reason : reason
});

updatedOrder.usersGroup = updatedOrder.users.group._id ;
updatedOrder.updatedAt =Date.now()
await updatedOrder.save();
  
  res.status(200).json({accept : updatedOrder });
});

exports.startWork = asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; 
  const orderId = req.params.id;
  const {reason} = req.body

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        users : loggedInUserId,
        
        },
         $addToSet: { usersOnprase:loggedInUserId  }
    },
    { new: true }
  );

  if (!updatedOrder ) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  if (updatedOrder.State !== 'accept' ) { 
    return next(new ApiError(`you need accepted order`, 404));
  }
  updatedOrder.StateWork =  'startwork';
  updatedOrder.StateWorkReasonAccept = reason ;
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
  action : startWorkMessageHistory ,
  reason: reason
});
updatedOrder.usersGroup = updatedOrder.users.group._id ;
updatedOrder.updatedAt =Date.now()
await updatedOrder.save();


  res.status(200).json({ accept : updatedOrder });
});

exports.endWork = asyncHandler(async(req,res,next) => {

  const loggedInUserId = req.user._id;
  const {reason} = req.body
  const currentOrder = await Order.findById(req.params.id);

  if (!currentOrder) {
    return next(new ApiError('Order not found', 404));
  }
  if (currentOrder.StateWork !== 'startwork' ) { 
    return next(new ApiError(`you need start the Work in order`, 404));
  }
  if (currentOrder.users.group.level === 3){
    console.log(currentOrder.users.group.level)
    await exports.confirmWork(req, res, next);
  }else {
 

  const updatedOrder = await Order
    .findByIdAndUpdate(req.params.id, { ...req.body}, { new: true })
    .populate('donimgs');

    updatedOrder.StateWork = 'endwork'
    updatedOrder.StateWorkReasonAccept = reason
    updatedOrder.users = updatedOrder.usersOnprase.filter(usersOnprase => usersOnprase.group.level === 3)[0]._id;
    updatedOrder.history.push({
      editedAt: Date.now(),
      editedBy: loggedInUserId,
      action: endWorkMessageHistory,
      reason:reason,
      imgDone: updatedOrder.donimgs
    });

    if (updatedOrder.users.group) {
      updatedOrder.usersGroup = updatedOrder.users.group._id;
    } 

    updatedOrder.updatedAt =Date.now()

    await updatedOrder.save();
    const updatOrder = await Order.findById(updatedOrder._id).populate('createdBy');

const roomUser = updatOrder.users.userId;
const message = {
  type: "order_update",
  title: "طلب جديد",
  body : `تم وصول طلب جديد من قبل ${req.user.group.name}`,
  action: "open_page",
  page : "onprase",
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
}
socketHandler.sendNotificationToUser(roomUser,message);

    res.status(200).json({ order: updatOrder });
}

}) 

exports.confirmWork  = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  const {reason} = req.body
  const orderId = req.params.id
  const currentOrder = await Order.findById(orderId);

  if (!currentOrder) {
    return next(new ApiError('Order not found', 404));
  }
  // if (currentOrder.StateWork !== 'endwork' ) { 
  //   return next(new ApiError(`you need end the Work in order`, 404));
  // }

  const updatedOrder = await Order
    .findByIdAndUpdate(req.params.id, { ...req.body}, { new: true })
    .populate('donimgs');

  updatedOrder.StateWork = 'confirmWork'
  updatedOrder.StateWorkReasonAccept = reason

  updatedOrder.usersOnprase.push(updatedOrder.users);

  updatedOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: confirmWorkMessageHistory,
    reason:reason,
    imgDone: updatedOrder.donimgs
  });

  updatedOrder.usersGroup = updatedOrder.users.group._id ;
  updatedOrder.users = updatedOrder.createdBy._id
  updatedOrder.updatedAt =Date.now()
  await updatedOrder.save();

  const updatOrder = await Order.findById(updatedOrder._id).populate('createdBy');

  const roomUser = updatOrder.users.userId;
  const message = {
    type: "order_update",
    title: "تاكيد الطلب",
    body : `اكذ انهاء العمل الذي تم من قبل ${req.user.group.name}`,
    action: "open_page",
    page : "onprase",
    orderID: updatOrder._id,
    time : updatOrder.updatedAt
}
  socketHandler.sendNotificationToUser(roomUser,message);


  res.status(200).json({ order: updatOrder });
});

exports.confirmCompletion =  asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; 
  const orderId = req.params.id;
  const {reason} = req.body

  const updatedOrder = await Order.findByIdAndUpdate(orderId);

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  if (updatedOrder.StateWork !== 'confirmWork' ) { 
    return next(new ApiError(`you need start the Work in order`, 404));
  }

  updatedOrder.StateDone = 'accept'
  updatedOrder.StateDoneReasonAccept = reason

updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
  action : confirmMessageHistory,
  reason : reason
});
updatedOrder.archive = true ;
updatedOrder.usersGroup = updatedOrder.users.group._id ;
updatedOrder.updatedAt =Date.now()
await updatedOrder.save();

const updatOrder = await Order.findById(updatedOrder._id).populate('usersOnprase','groups');

const message = {
  type: "order_update",
  title: "تاكيد الطلب",
  body : `تم تاكيد اتمام العمل من قبل ${req.user.group.name}`,
  action: "open_page",
  page : "archive",
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
}

const roomName = updatOrder.users.userId;
socketHandler.sendNotificationToUser(roomName, message);

  res.status(200).json({ accept :updatOrder});
});

exports.AcceptArchive = asyncHandler(async (req, res, next) => {
 
    try {
      const orderId = req.params.id;

      const AcceptArchive = await Order.findById(orderId);
      AcceptArchive.archive = true ;
      AcceptArchive.save();

      res.status(200).json({ accept : AcceptArchive});
    } catch (error) {
      return next(new ApiError(500, 'Internal Server Error'));
    }
});
  