/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
const asyncHandler = require('express-async-handler');

const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const Order = require('../models/orderModel')
const groups = require('../models/groupUser')
const user = require('../models/userModel')
const ApiFeatures = require('../utils/apiFeatures')
const ApiError = require('../utils/apiError');
const TypeText1 = require('../models/typeText1');
const TypeText2 = require('../models/typeText2');
const TypeText3 = require('../models/typeText3');

const { uploadMixOfImages } = require('../middlewares/uploadImage');

exports.uploadOrderImage = uploadMixOfImages([
  {
    name: 'orderimg',
    maxCount: 1,
  },
  {
    name: 'donimgs',
    maxCount: 5,
  },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {
  // Image processing for orderimg
  if (req.files && req.files.orderimg) {
    const orderimgFileName = `order-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.files.orderimg[0].buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/orders/${orderimgFileName}`);

    // Save image into our db
    req.body.orderimg = orderimgFileName;
  }

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
  next();
});

exports.createOrderSend = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  // جلب بيانات المستخدم بما في ذلك levelSend
  const users = await user.findOne({ _id: loggedInUserId });

  if (!req.user.Permission.canCreatOrder) {
    return next(new ApiError('You do not have permission to delete this order', 403));
  }

  if (!users) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  // احصل على الكروب الذي يحتوي على مستوى أقل برقم واحد
  const lowerLevelGroup = users.group.levelSend;
  // تحقق من وجود الكروب
  if (!lowerLevelGroup) {
    return  next(new ApiError(`Not found levelSend`, 404));
  }

  const groupss = [users.group._id];

  const orderData = {
    type1: req.body.type1,
    type2: req.body.type2,
    type3: req.body.type3,
    caption: req.body.caption,
    number : req.body.number,
    group: lowerLevelGroup ,
    groups: groupss ,
    createdBy: req.user._id,
    user : req.body.user,
    orderimg : req.body.orderimg,
    donimgs :req.body.donimgs
  };
  // تحقق من وجود lowerLevelGroup._id قبل الطباعة


  const newOrder = await Order.create(orderData);
    newOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: `تم انشاء الطلب من قيل : ${loggedInUserId}`
  });
  newOrder.save()
  res.status(201).json({ order: newOrder });
});

exports.getOrder = asyncHandler(async (req, res, next) => {

  if (!req.user.Permission.canViwOneOrder) {
    return next(new ApiError('You do not have permission to viw this order', 403));
  }

  const { id } = req.params;

  const document = await Order.findById(id);

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

  const document = await Order.findByIdAndDelete(id);

  if (!document) {
    return next(new ApiError(`No document for this id ${id}`, 404));
  }
  res.status(204).send();
});

exports.updateOrder = asyncHandler(async (req, res, next) => {
  const loggedInUserId = req.user._id;

  // التحقق من صلاحيات التحرير
  if (!req.user.Permission.canEidtOrder) {
    return next(new ApiError('You do not have permission to edit this order', 403));
  }

  // جلب الطلب الحالي قبل التعديل
  const currentOrder = await Order.findById(req.params.id);

  if (!currentOrder) {
    return next(new ApiError('Order not found', 404));
  }

  // إعداد قيمة group الجديدة بتوصيف الطلب الحالي والقيمة الجديدة
  const updatedGroup = [...currentOrder.group, ...req.body.group];

  // تحديث الطلب باستخدام findByIdAndUpdate
  const updatedOrder = await Order
    .findByIdAndUpdate(req.params.id, { ...req.body, group: updatedGroup }, { new: true })
    .populate('donimgs');

  // إضافة إدخال إلى سجل التاريخ
  updatedOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: `تم تعديل الطلب من قبل: ${loggedInUserId}`
  });

  // حفظ التغييرات
  await updatedOrder.save();

  res.status(200).json({ order: updatedOrder });
});

exports.getOrders = asyncHandler(async (req, res, next) => {
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
  const groupFilter = { group: { $in: groupIds } };
  
  // حصول على إحصائيات الطلبات
  const orderStats = await getAggregateStats(Order, groupIds, filter, 'State');
  const stateWorksStats = await getAggregateStats(Order, groupIds, filter, 'StateWork');
  const StateDoneStats = await getAggregateStats(Order, groupIds, filter, 'StateDone')
  
  const documentsCounts = await Order.countDocuments();
  
  const apiFeatures = new ApiFeatures(Order.find({ ...groupFilter, ...filter }), req.query)
    .paginate(documentsCounts)
    .filter()
    .search(Order)
    .limitFields()
    .sort();
  
  const { mongooseQuery, paginationResult } = await apiFeatures;
  const documents = await mongooseQuery;
  
  res
    .status(200)
    .json({ results: documents.length, paginationResult, orderStats, stateWorksStats,StateDoneStats, order: documents });
})

exports.getOnpraseOrders = asyncHandler(async (req, res, next) => {
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
  const userGroupInLevel = userGroup.group.inlevel;
  

  // البحث عن الكروبات التي تحمل نفس مستوى الفل ونفس مستوى inlevel
  const similarGroups = await groups.find({ level: userGroupLevel, inlevel: userGroupInLevel });

  // جمع معرفات الكروبات
  const groupIds = similarGroups.map(group => group._id);

  // استبعاد كروب المستخدم من البحث وإضافة الكروبات الأخرى
  const groupFilter = {
    groups: {
      $in: groupIds ,// إضافة الكروبات الأخرى
    }
  };

  // حصول على إحصائيات الطلبات
  const orderStats = await getAggregateStats(Order, groupIds, filter, 'State');
  const stateWorksStats = await getAggregateStats(Order, groupIds, filter, 'StateWork');
  const StateDoneStats = await getAggregateStats(Order, groupIds, filter, 'StateDone');
  
  const documentsCounts = await Order.countDocuments();

  const apiFeatures = new ApiFeatures(Order.find({ ...groupFilter, ...filter }), req.query)
    .paginate(documentsCounts)
    .filter()
    .search(Order)
    .limitFields()
    .sort();

  const { mongooseQuery, paginationResult } = await apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, orderStats, stateWorksStats, StateDoneStats, order: documents });
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

exports.getAllText = asyncHandler(async (req, res, next) => {
  try {
    // جلب البيانات من TypeText1
    const typeText1Data = await TypeText1.find({});

    // جلب البيانات من TypeText2 مع البيانات المتعلقة من TypeText3
    const typeText2Data = await TypeText2.find({}).populate('typeText3');

    // جلب البيانات من TypeText3
    const typeText3Data = await TypeText3.find({});

    // إرجاع البيانات
    res.status(200).json({ typeText1Data, typeText2Data, typeText3Data });
  } catch (error) {
    next(new ApiError(`Error fetching data: ${error.message}`, 500));
  }
});

