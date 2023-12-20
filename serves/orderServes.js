const asyncHandler = require('express-async-handler');
const factory = require('./handlers')
const order = require('../models/orderModel')
const ApiError = require('../utils/apiError');
const user = require('../models/userModel')

exports.createOrder = factory.createOne(order);

exports.getOrder = factory.getOne(order)

exports.getsOrder = factory.getAll(order);

exports.deleteOrder = factory.deleteOne(order)

exports.updateOrder = factory.updateOne(order);

exports.acceptOrder = asyncHandler(async(req,res,next) =>{
  
    const useraccept = await order.findByIdAndUpdate(
        req.params.id,
        req.body,
    
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
          req.body,
      
          {
              new: true,
            });
            userReject.State = "reject"
      if (!userReject) {
          return next(new ApiError(`No reject for this id`, 404));
        }
        res.status(200).json({ data: userReject });
      });
