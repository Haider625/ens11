const asyncHandler = require('express-async-handler');
const order = require('../models/orderModel')
const ApiError = require('../utils/apiError');
const User = require('../models/userModel');
const archive = require('../models/archive')

exports.rejectOrder = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  const { user, reason } = req.body;

  if (!req.user.Permission.canRejectOrder) {
    return res.status(403).json({ success: false, message: 'Unauthorized to reject orders' });
  }

  // رفض الطلب
  const rejectOrder = await order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        'State': 'reject',
        'reason': reason,
        updatedBy: userId,
        // receiver: user,
      }
    },
    { new: true }
  );
  if (!rejectOrder) {
    return next(new ApiError(`No order found for this id`, 404));
  }

  // جلب مستخدم بمستوى أعلى
  const higherLevelUser = await User.findOne(
    { level: { $gt: rejectOrder.level } },
    'name level inlevel '
  ).sort({ level: +1 }); // ترتيب من الأعلى إلى الأدنى

  if (higherLevelUser) {
    // تحديث قيمة الكروب داخل الطلب إلى قيمة الكروب الموجودة في المستخدم ذو الفل الجديد
    rejectOrder.group = higherLevelUser.group;
    await rejectOrder.save();
  }

  res.status(200).json({ success: true, data: { rejectOrder } });
});

exports.getGroupscanViwGroups = asyncHandler(async (req, res, next) => {
  try {
    // تأكيد وجود userId في طلب الوارد
    const userId = req.user._id;

    // البحث عن المستخدم باستخدام userId
    const user = await User.findOne({ _id: userId });

    // التحقق مما إذا كان المستخدم موجودًا وإذا كان لديه مصفوفة levelsReceive
    if (user && user.levelsReceive && user.levelsReceive.length > 0) {
      // جلب مستخدمي المستويات المتعلقة بالمستخدم من مصفوفة levelsReceive
      const groupIds = user.levelsReceive;
      const usersInLevelsReceive = await User.find({ '_id': { $in: groupIds } }, 'name level inlevel');

      res.status(200).json({ success: true, data: usersInLevelsReceive });
    } else {
      // إذا لم يتم العثور على المستخدم أو لم يكن لديه مصفوفة levelsReceive
      return next(new ApiError(404, 'User not found or does not have levelsReceive groups'));
    }
  } catch (error) {
    console.error('Error in getGroupscanViwGroups:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.rejectWork = asyncHandler(async(req,res,next) => {

  const orderId = req.params.id;
  const userId = req.user._id; // افتراض وجود نظام المصادقة وتوفر معرف المستخدم

  const { user, reason } = req.body; // معرف المستلم المحدد من المستخدم وسبب الرفض

  // التحقق مما إذا كان يمكن للمستخدم الحالي رفض الطلب
  if (!req.user.Permission.canRejectWork) {
    return next(new ApiError(403, 'Unauthorized to reject orders'));
  }

  const rejectOrder = await User.findByIdAndUpdate(
    orderId,
    {
      'StateWork': 'reject',
      'StateWork.reason': reason,
      updatedBy: userId,
      receiver: user,
    },
    { new: true }
  );

  if (!rejectOrder) {
    return next(new ApiError(`No order found for this id`, 404));
  }
  const higherLevelUser = await User.findOne(
    { level: { $gt: rejectOrder.level } },
    'name level inlevel '
  ).sort({ level: +1 }); // ترتيب من الأعلى إلى الأدنى

  if (higherLevelUser) {
    // تحديث قيمة الكروب داخل الطلب إلى قيمة الكروب الموجودة في المستخدم ذو الفل الجديد
    rejectOrder.group = higherLevelUser.group;
    await rejectOrder.save();
  }

  res.status(200).json({ success: true, data: rejectOrder });
});

exports.getRejectedOrders = asyncHandler(async (req, res, next) => {
  try {
    // استخدام دالة find للبحث عن الطلبات بحالة "reject"
    const rejectedOrders = await order.find({ State: 'reject' });

    res.status(200).json({ success: true, data: rejectedOrders });
  } catch (error) {
    console.error('Error in getRejectedOrders:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.getRejectedWorks = asyncHandler(async (req, res, next) => {
  try {
    // استخدام دالة find للبحث عن الطلبات بحالة "reject"
    const rejectedOrders = await order.find({ StateWork: 'reject' });

    res.status(200).json({ success: true, data: rejectedOrders });
  } catch (error) {
    console.error('Error in getRejectedOrders:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.getOrdersWithRejectState = asyncHandler(async (req, res, next) => {
  try {
    // استخدام دالة find للبحث عن الطلبات بحالة "reject" في الحقل State أو StateWork
    const ordersWithRejectState = await order.find({
      $or: [
        { State: 'reject' },
        { StateWork: 'reject' }
      ]
    });

    res.status(200).json({ success: true, data: ordersWithRejectState });
  } catch (error) {
    console.error('Error in getOrdersWithRejectState:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.archiveOrder = asyncHandler(async (req, res, next) => {
  try {
    const orderId = req.params.id;

    // العثور على الطلب الحالي
    const currentOrder = await order.findById(orderId);

    // التحقق مما إذا كان الطلب موجودًا
    if (!currentOrder) {
      return next(new ApiError(404, 'Order not found'));
    }

    // إنشاء سجل للطلب المكتمل
    // eslint-disable-next-line new-cap
    const completedRequest = new archive.create({
      orderId: currentOrder._id,
      completedBy: req.user._id, // افتراض وجود نظام المصادقة وتوفر معرف المستخدم
      completionDate: new Date(),
    });

    // حفظ السجل
    await completedRequest.save();

    // اختيار إزالة الطلب من قاعدة البيانات أو تركه حسب احتياجات التطبيق
    // يمكنك استخدام currentOrder.remove() إذا كنت تريد حذفه تمامًا

    res.status(200).json({ success: true, data: completedRequest });
  } catch (error) {
    console.error('Error in archiveOrder:', error);
    return next(new ApiError(500, 'Internal Server Error'));
  }
});

exports.forwordReject = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const {newGroupId} = req.body; // معرف المجموعة الجديدة

  // قم بالبحث عن الطلب باستخدام معرف الطلب
  const orders = await order.findById(orderId);

  if (!orders) {
    return next(new ApiError(`No order found for this id`, 404));
  }

  // قم بتحديث قيمة الكروب لتكون معرف المجموعة الجديدة
  order.group = newGroupId;

  // احفظ التغييرات
  await order.save();

  res.status(200).json({ success: true, data: order });
});