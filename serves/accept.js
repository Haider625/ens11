const asyncHandler = require('express-async-handler');

const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp')

const Order = require('../models/orderModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const socketHandler  = require('../utils/socket');

const { uploadMixOfImages } = require('../middlewares/uploadImage');

exports.uploadOrderImage = uploadMixOfImages([

  {
    name: 'donimgs',
    maxCount: 5,
  },
  {
    name: 'imgDone',
    maxCount: 5,
  },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Image processing for donimgs
  if (req.files && req.files.donimgs) {
    req.body.donimgs = [];
    await Promise.all(
      req.files.donimgs.map(async (img, index) => {
        const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
  
        await sharp(img.buffer)
          .resize(600, 600)
          .toFormat('jpeg')
          .jpeg({ quality: 95 })
          .toFile(`uploads/orders/${imageName}`, (err) => {
            if (err) {
              console.error('Error saving image:', err);
            } else {
              req.body.donimgs.push(imageName) ;
            }
          });
      })
    );
  }
  if (req.files && req.files.donimgs) {
    req.body.imgDone = []; // قم بإعادة تهيئة قائمة الصور المنتهية
    await Promise.all(
        req.files.donimgs.map(async (img, index) => {
            const imageName = `order-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

            await sharp(img.buffer)
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
  const loggedUser = req.user
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
  action : `تم توجيه الطلب من قبل`,
  reason : reason
});  
  }else {
    updatedOrder.history.push({
      editedAt: Date.now(),
      editedBy: loggedInUserId ,
      action : `تم قبول الطلب من قبل`,
      reason : reason
    });
  }
  updatedOrder.State = 'accept' 
// if (updatedOrder.groups === null || updatedOrder.groups === undefined) {
//   updatedOrder.groups = [loggedUser.group];
// } else {
//   updatedOrder.groups.push(loggedUser.group);
// }

updatedOrder.usersOnprase.push(updatedOrder.users);

updatedOrder.group = null ;
updatedOrder.updatedAt =Date.now()

await updatedOrder.save();

const updatOrder = await Order.findById(updatedOrder._id).populate('users');

const roomUser = updatOrder.users.userId;
const message = 'اجراء اللازم لطفاً';
socketHandler.sendNotificationToUser(roomUser,message);

  res.status(200).json({accept : updatOrder });
});

exports.acceptwork = asyncHandler(async(req,res,next) => {
  const orderId = req.params.id;
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const {reason} = req.body
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
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
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
 action : `تم قبول العمل من قبل`,
 reason : reason
});


updatedOrder.updatedAt =Date.now()
await updatedOrder.save();
  
  res.status(200).json({accept : updatedOrder });
});

exports.startWork = asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const orderId = req.params.id;
  const loggedUser = req.user
  const {reason} = req.body
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        StateWork: 'startwork',
        StateWorkReasonAccept : reason ,
        users : loggedInUserId,
        
        },
         $addToSet: { usersOnprase:loggedInUserId  }
    },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  // if (updatedOrder.usersOnprase === null || updatedOrder.usersOnprase === undefined) {
  //   updatedOrder.usersOnprase = [loggedUser];
  // } else {
  //   updatedOrder.usersOnprase= {$addToSet: { usersOnprase:loggedInUserId  }}
  // }
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
  action : `تم بدء العمل من قبل` ,
  reason: reason
});
updatedOrder.updatedAt =Date.now()
await updatedOrder.save();
const updatOrder = await Order.findById(updatedOrder._id).populate('createdBy');

const roomUser = updatOrder.createdBy.userId;
const message = 'يتم تنفيذ طلبك';
socketHandler.sendNotificationToUser(roomUser,message);
  res.status(200).json({ accept : updatOrder });
});

exports.endWork = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;
  const {reason} = req.body
  const currentOrder = await Order.findById(req.params.id);

  if (!currentOrder) {
    return next(new ApiError('Order not found', 404));
  }

  const updatedOrder = await Order
    .findByIdAndUpdate(req.params.id, { ...req.body}, { new: true })
    .populate('donimgs');
  
  updatedOrder.StateWork = 'endwork'
  updatedOrder.StateWorkReasonAccept = reason
  updatedOrder.users = null
  updatedOrder.usersOnprase.push(updatedOrder.createdBy);
  updatedOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: `تم انهاء العمل من قبل`,
    reason:reason,
    imgDone: updatedOrder.donimgs
  });
  updatedOrder.updatedAt =Date.now()
  await updatedOrder.save();

  const updatOrder = await Order.findById(updatedOrder._id).populate('createdBy');

const roomUser = updatOrder.createdBy.userId;
const message = 'يرجى تاكيد انجاز العمل';
socketHandler.sendNotificationToUser(roomUser,message);

  res.status(200).json({ order: updatOrder });
});

exports.confirmWorkCompletion =  asyncHandler(async(req,res,next) => {
  const loggedInUserId = req.user._id; // ايجاد المستخدم الذي عمل تسجيل دخول
  const orderId = req.params.id;
  const {reason} = req.body
  // تحديث حالة الطلب إلى "accept" وسجل معرف المستخدم الذي قام بالتحديث
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { 
      
        StateDone: 'accept',
        StateDoneReasonAccept : reason
        
    },
    { new: true }
  );

  if (!updatedOrder) { 
    return next(new ApiError(`No order found for this id`, 404));
  }
  // إضافة سجل جديد إلى مصفوفة history
updatedOrder.history.push({
  editedAt: Date.now(),
  editedBy: loggedInUserId,
  action : `تم تاكيد اتمام العمل من قبل`,
  reason : reason
});
updatedOrder.archive = true ;
updatedOrder.updatedAt =Date.now()
await updatedOrder.save();

const updatOrder = await Order.findById(updatedOrder._id).populate('usersOnprase','groups');

updatOrder.usersOnprase.forEach(users => {
  const roomName = users.userId;
  const message = 'تم تاكيد انجاز العمل';
  
  if (roomName !== loggedInUserId) {
    socketHandler.sendNotificationToUser(roomName, message);
  }

});

updatOrder.groups.forEach(group => {
  const roomName = group.name;
  const message = 'تم تاكيد انجاز العمل';
  socketHandler.sendNotificationToRoom(roomName, message);

});

  
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
  
