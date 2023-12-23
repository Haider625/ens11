const asyncHandler = require('express-async-handler');
const factory = require('./handlers')
const order = require('../models/orderModel')
const ApiError = require('../utils/apiError');
const user = require('../models/userModel')
// eslint-disable-next-line import/newline-after-import
const ApiFeatures = require('../utils/apiFeatures')
exports.createOrder = factory.createOne(order);

exports.getDataUserOrder =   asyncHandler(async (req, res, next) => {
  // eslint-disable-next-line no-shadow
  const { user } = req.params;
  const document = await order.findById(user);
  if (!document) {
     return next(new ApiError(`No document for this id ${user}`, 404));
  }
  res.status(200).json({ data: document });
});
exports.getOrder = factory.getOne(order)
// exports.getsOrder = factory.getAll(order , 'user');

exports.deleteOrder = factory.deleteOne(order);

exports.updateOrder = factory.updateOne(order);

exports.acceptOrder = asyncHandler(async(req,res,next) =>{
  
    const useraccept = await order.findByIdAndUpdate(
        req.params.id,
        // req.body,
    
        {
            new: true,
          });
          useraccept.State = "accept"
    if (!useraccept) {
        return next(new ApiError(`No accept for this id`, 404));
      }
      res.status(200).json({ data: useraccept });
    });

exports.rejectOrder = asyncHandler(async(req,res,next) =>{
  
      const userReject = await order.findByIdAndUpdate(
          req.params.id,
          // req.body,
      
          {
              new: true,
            });
            userReject.State = "reject"
      if (!userReject) {
          return next(new ApiError(`No reject for this id`, 404));
        }
        res.status(200).json({ data: userReject });
      });

exports.forwordOrder =  asyncHandler(async(req,res,next) =>{
        // eslint-disable-next-line no-shadow
        const {user} = req.body   
        const userforword= await order.findByIdAndUpdate(
            req.params.id,
            // req.body,
           {user},
            {new: true,});
            userforword.State = "onprase"
        if (!userforword) {
            return next(new ApiError(`No forword for this id`, 404));
          }
          res.status(200).json({ data: userforword });
        });
// exports.getSections =  asyncHandler(async(req,res,next) =>{
//         const {id} = req.p
//         const useraccept = await order.findById({id}).populate('Sections');
//       if (!useraccept) {
//           return next(new ApiError(`No accept for this id`, 404));
//         }
//         res.status(200).json({data: useraccept });
//       });

exports.getsOrders =  asyncHandler(async (req, res) => {
  let filter = {};
  if (req.filterObj) {
    filter = req.filterObj;
  }
 
  // Build query
  const documentsCounts = await order.countDocuments();
  const apiFeatures = new ApiFeatures(order.find(filter), req.query)
    .paginate(documentsCounts)
    .filter()
    .limitFields()
    .sort();

  // Execute query
  const { mongooseQuery, paginationResult } = await apiFeatures;
  const documents = await mongooseQuery;
  
  res
    .status(200)
    .json({ results: documents.length, paginationResult, orders: documents });
});
    