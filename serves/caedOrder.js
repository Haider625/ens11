/* eslint-disable no-undef */
const asyncHandler = require('express-async-handler');

const factory = require('./handlers')
const cardOrder = require('../models/cardOrder')
const user = require('../models/userModel')

exports.createcardOrder = factory.createOne(cardOrder)

exports.acceptOrder = asyncHandler(async (req, res, next) => {

    const useraccept = await user.findByIdAndUpdate(
        req.user._id,
        {
          $addToSet: { acceptorders: req.body.userID },
        },
        { new: true }
      );
    
      res.status(200).json({
        status: 'success',
        message: 'order accepted ',
        data: useraccept.acceptorders,
      });
  });

  exports.rejectOrder = asyncHandler(async (req, res, next) => {

    const userReject = await user.findByIdAndUpdate(
        req.user._id,
        {
          $addToSet: { reject: req.body.userID },
        },
        { new: true }
      );
    
      res.status(200).json({
        status: 'success',
        message: 'order reject ',
        data: userReject.reject,
      });
  });
// exports.acceptOrder = asyncHandler(async (req, res, next) => {
//     if (req.userId) {
//         const role = message.guild.roles.cache.find(
//             // eslint-disable-next-line no-shadow
//             (role) => role === "admin"
//         );
//         res.status(200).json({role : role})
//     }
//     next();
// })
exports.getcardOrder = factory.getOne(cardOrder)

exports.forwordOrder = factory.getAll(cardOrder)

exports.waitOrder = factory.deleteOne(cardOrder)

exports.updatecardOrder = factory.updateOne(cardOrder)
