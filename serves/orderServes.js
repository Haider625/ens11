/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
const asyncHandler = require('express-async-handler');

const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const order = require('../models/orderModel')
const groups = require('../models/groupUser')
const user = require('../models/userModel')
const ApiFeatures = require('../utils/apiFeatures')
const ApiError = require('../utils/apiError');
const { uploadMixOfImages } = require('../middlewares/uploadImage');

exports.uploadProductImages = uploadMixOfImages([
  {
    name: 'orderimg',
    maxCount: 1,
  },
  {
    name: 'donImgs',
    maxCount: 5,
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  //1- Image processing for orderimg
  if (req.files.orderimg) {
    const orderimgFileName = `orderimg-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.files.orderimg[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/orders/${orderimgFileName}`);

    // Save image into our db
    req.body.orderimg = orderimgFileName;
  }
  //2- Image processing for donImgs
  if (req.files.donImgs) {
    req.body.donImgs = [];
    await Promise.all(
      req.files.donImgs.map(async (img, index) => {
        const imageName = `donImgs-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 95 })
          .toFile(`uploads/orders/${imageName}`);

        // Save image into our db
        req.body.donImgs.push(imageName);
      })
    );

    next();
  }
});

exports.createOrderSend = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  // جلب بيانات المستخدم بما في ذلك levelSend
  const users = await user.findOne({ _id: loggedInUserId }).populate('levelSend');

  if (!users) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // احصل على الكروب الذي يحتوي على مستوى أقل برقم واحد
  const lowerLevelGroup = users.levelSend;

  // تحقق من وجود الكروب
  if (!lowerLevelGroup) {
    return res.status(400).json({ success: false, error: 'No lower level group found' });
  }

  const orderData = {
    title: req.body.title,
    caption: req.body.caption,
    materialName: req.body.materialName,
    type: req.body.type,
    State: req.body.State,
    group: lowerLevelGroup._id,
    createdBy: req.user._id,
    user : req.body.user
  };

  const newOrder = await order.create(orderData);

  res.status(201).json({ success: true, order: newOrder });
});

exports.createOrder = asyncHandler(async (req, res, next) => {

  // التأكد من أن لديه الصلاحية المطلوبة لإنشاء الطلب
  if (!req.user.Permission.canCreatOrder) {
    return res.status(403).json({ message: 'Permission denied' });
  }
  
  // التأكد من وجود معرّف كروب مرتبط بالمستخدم المسجّل
  const userGroupId = req.user.group;
  const loggedInUserId = req.user._id;

  if (!userGroupId) {
    return res.status(400).json({ message: 'User group not found' });
  }
// البحث عن الكروب الذي يحتوي على مستوى أقل برقم واحد
const lowerLevelGroup = await groups.findOne({ level: Math.floor (userGroupId.level - 1 )});

if (!lowerLevelGroup) {
    return res.status(400).json({ message: 'Lower level group not found' });
}
  // التحقق من أن inlevel يتطابق مع الكروب المتعلق بالمستخدم
  if (userGroupId.inlevel !== lowerLevelGroup.inlevel) {
    return res.status(400).json({ message: 'Mismatch between user group and lower level group' });
  }
  // إنشاء الطلب في الكروب الجديد
  const newDoc = await order.create({
    title: req.body.title,
    caption: req.body.caption,
    materialName: req.body.materialName,
    type: req.body.type,
    State: req.body.State,
    group: lowerLevelGroup._id, // استخدام معرّف الكروب الذي يحتوي على مستوى أقل برقم واحد
    createdBy: req.user._id
  });

  if (!newDoc) {
    return next(new ApiError(`No document for this id ${req.body}`, 404));
  }

  newDoc.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: `تم انشاء الطلب من قيل : ${loggedInUserId}`
  });

  res.status(201).json({ order: newDoc });
});

exports.getOrder = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwOneOrder) {
    return next(new ApiError('You do not have permission to viw this order', 403));
  }

  const { id } = req.params;

  const document = await order.findById(id);

  if (!document) {
     return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(200).json({ order: document });
});

exports.deleteOrder = asyncHandler(async (req, res, next) => {
    
  const { id } = req.params;

  if (!req.user.Permission.canDeletOrder) {
    return next(new ApiError('You do not have permission to delete this order', 403));
  }

  const document = await order.findByIdAndDelete(id);

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});

exports.updateOrder = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canEidtOrder) {
    return next(new ApiError('You do not have permission to edit this order', 403));
  }

  const document = await order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!document) {
    return next(
      new ApiError(`No document for this id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ order: document });
});

exports.getsOrders = asyncHandler(async (req, res, next) => {
  // التأكد من أن لديه الصلاحية المطلوبة للوصول لبيانات الطلب
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
  const userGroupInLevel = userGroup.group.inlevel; // إضافة هذا السطر للحصول على inlevel
  
  // البحث عن الكروبات التي تحمل نفس مستوى الفل ونفس مستوى inlevel
  const similarGroups = await groups.find({ level: userGroupLevel, inlevel: userGroupInLevel });
  
  // جمع معرفات الكروبات
  const groupIds = similarGroups.map(group => group._id);
  
  // إضافة شرط للبحث عن الطلبات التي تنتمي إلى الكروبات المطابقة في سجل المستخدم
  const groupFilter = { group: { $in: groupIds }};
  
  // حصول على إحصائيات الطلبات
  const orderStats = await getAggregateStats(order, groupIds, filter, 'State');
  const stateWorksStats = await getAggregateStats(order, groupIds, filter, 'StateWork');
  
  const documentsCounts = await order.countDocuments();
  
  const apiFeatures = new ApiFeatures(order.find({ ...groupFilter, ...filter }).populate('group createdBy'), req.query)
    .paginate(documentsCounts)
    .filter()
    .search(order)
    .limitFields()
    .sort();
  
  const { mongooseQuery, paginationResult } = await apiFeatures;
  const documents = await mongooseQuery;
  
  res
    .status(200)
    .json({ results: documents.length, paginationResult, orderStats, stateWorksStats, order: documents });
});

// وظيفة مساعدة للحصول على إحصائيات الطلبات
async function getAggregateStats(model, groupIds, filter, field) {
  const stats = await model.aggregate([
    {
      $match: {
        group: { $in: groupIds },
        ...filter
      }
    },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 }
      }
    }
  ]);

  // تحويل نتائج الإحصائيات إلى كائن
  return Object.fromEntries(stats.map(item => [item._id, item.count]));
}
