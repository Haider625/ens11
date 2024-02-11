const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel')
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const archive = require('../models/archive')

exports.getRejectedOrders = asyncHandler(async (req, res) => {

  const filter = { State: 'reject', groups: req.user.group };
    // Build query
    const documentsCounts = await Order.countDocuments();
    const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(Order)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

exports.getRejectedWorks = asyncHandler(async (req, res) => {

  const filter = { StateWork: 'reject', groups: req.user.group };
    // Build query
    const documentsCounts = await Order.countDocuments();
    const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(Order)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

exports.getRejectedDone = asyncHandler(async (req, res) => {

  const filter = { StateDone: 'reject', groups: req.user.group };
    // Build query
    const documentsCounts = await Order.countDocuments();
    const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(Order)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

exports.getOrdersWithRejectState = asyncHandler(async (req, res) => {

  const filter = { $or: [{ StateDone: 'reject' }, { State: 'reject' }, { StateWork: 'reject' }], groups: req.user.group };
    // Build query
    const documentsCounts = await Order.countDocuments();
    const apiFeatures = new ApiFeatures(Order.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(Order)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });

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
  const userId = req.user._id;
  const loggedUser = req.user;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectOrder) {
    return next(new ApiError('Unauthorized to reject orders' ,403));
  }
    // العثور على الطلب وتحديث حالته
    const rejectOrder = await Order.findById(orderId);

    if (!rejectOrder) {
      return next(new ApiError(`No order found for this id`, 404));
    }

    rejectOrder.State = 'reject';
    rejectOrder.StateReasonReject = reason;

    // إضافة معلومات السجل
    rejectOrder.history.push({
      editedAt: Date.now(),
      editedBy: userId,
      action: `تم رفض الطلب من قبل :${userId}`,
      reason: reason
    });

    const lastGroup = rejectOrder.groups[rejectOrder.groups.length - 1]
    // تحديث الكروب والفلات المتعلقة بالمستخدم المسجل
    rejectOrder.group = lastGroup ;

    // التحقق من قيمة rejectOrder.groups وإضافة قيمة المجموعة الجديدة إليها
    if (rejectOrder.groups === null || rejectOrder.groups === undefined) {
      rejectOrder.groups = [loggedUser.group];
    } else {
      rejectOrder.groups.push(loggedUser.group);
    }
    // حفظ التغييرات
    await rejectOrder.save();

    res.status(200).json({ rejectOrder });
});

exports.rejectWork = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;
  const loggedUser = req.user;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectWork) {
    return next(new ApiError('Unauthorized to reject work' ,403));
  }
    // العثور على الطلب وتحديث حالته
    const rejectWork = await Order.findById(orderId);

    if (!rejectWork) {
      return next(new ApiError(`No order found for this id`, 404));
    }

    rejectWork.StateWork = 'reject';
    rejectWork.StateWorkReasonReject = reason;

    // إضافة معلومات السجل
    rejectWork.history.push({
      editedAt: Date.now(),
      editedBy: userId,
      action: `تم رفض الطلب من قبل :${userId}`,
      reason: reason
    });

    const lastGroup = rejectWork.groups[rejectWork.groups.length - 1]
    // تحديث الكروب والفلات المتعلقة بالمستخدم المسجل
    rejectWork.group = lastGroup ;

    // التحقق من قيمة rejectOrder.groups وإضافة قيمة المجموعة الجديدة إليها
    if (rejectWork.groups === null || rejectWork.groups === undefined) {
      rejectWork.groups = [loggedUser.group];
    } else {
      rejectWork.groups.push(loggedUser.group);
    }
    // حفظ التغييرات
    await rejectWork.save();

    res.status(200).json({ rejectWork });
});

exports.rejectConfirm = asyncHandler(async (req, res, next) => {
  const orderId = req.params.id;
  const userId = req.user._id;
  const loggedUser = req.user;

  const { reason } = req.body;

  if (!req.user.Permission.canRejectWork) {
    return next(new ApiError('Unauthorized to reject work' ,403));
  }
    // العثور على الطلب وتحديث حالته
    const rejectConfirm = await Order.findById(orderId);

    if (!rejectConfirm) {
      return next(new ApiError(`No order found for this id`, 404));
    }

    rejectConfirm.StateDone = 'reject';
    rejectConfirm.StateDoneReasonReject = reason;

    // إضافة معلومات السجل
    rejectConfirm.history.push({
      editedAt: Date.now(),
      editedBy: userId,
      action: `تم رفض الطلب من قبل :${userId}`,
      reason: reason
    });

    const lastGroup = rejectConfirm.groups[rejectConfirm.groups.length - 2]
    // تحديث الكروب والفلات المتعلقة بالمستخدم المسجل
    rejectConfirm.group = lastGroup ;

    // التحقق من قيمة rejectOrder.groups وإضافة قيمة المجموعة الجديدة إليها
    if (rejectConfirm.groups === null || rejectConfirm.groups === undefined) {
      rejectConfirm.groups = [loggedUser.group];
    } else {
      rejectConfirm.groups.push(loggedUser.group);
    }
    // حفظ التغييرات
    await rejectConfirm.save();

    res.status(200).json({ rejectConfirm });
});

exports.archiveReject = asyncHandler(async (req, res, next) => {

    const orderId = req.params.id;

    // العثور على الطلب الحالي
    const currentOrder = await Order.findById(orderId);

    // التحقق مما إذا كان الطلب موجودًا
    if (!currentOrder) {
      return next(new ApiError(404, 'Order not found'));
    }

    // إنشاء سجل للطلب المكتمل
    // eslint-disable-next-line new-cap
    const completedRequest = new archive({
      orderId: currentOrder._id,
      completedBy: req.user._id, // افتراض وجود نظام المصادقة وتوفر معرف المستخدم
      completionDate: new Date(),
    });

    // حفظ السجل
    await completedRequest.save();
    res.status(200).json({ completedRequest });
});
