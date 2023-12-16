const factory = require('./handlers')
const cardOrder = require('../models/cardOrder')
// eslint-disable-next-line import/order
const asyncHandler = require('express-async-handler');

exports.acceptOrder =  
asyncHandler(async (req, res) => {
    const {user} = req.body;
    const category = await cardOrder.create({ user, });
    res.status(201).json({ data: category });
    });
// asyncHandler(async (req, res, next) => {
//1- get order by user
// const acceptOrder = await cardOrder.findById(
//     req.user._id,
//     {
//       user: req.body.user,
//       accept: req.body.accept,
//     },
//   );

//   res.status(200).json({ data: acceptOrder });
// 2- send order to the user



exports.rejuctOrder = factory.getOne(cardOrder)

exports.forwordOrder = factory.getAll(cardOrder)

exports.waitOrder = factory.deleteOne(cardOrder)

