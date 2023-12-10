const factory = require('./handlers')
const order = require('../models/orderModel')


exports.createOrder = factory.createOne(order);

exports.getOrder = factory.getOne(order)

exports.getsOrder = factory.getAll(order)

exports.deleteOrder = factory.deleteOne(order)

exports.updateOrder = factory.updateOne(order)