const factory = require('./handlers')
const cardOrder = require('../models/cardOrder')


exports.createcardOrder = factory.createOne(cardOrder);

exports.getcardOrder = factory.getOne(cardOrder)

exports.getscardOrder = factory.getAll(cardOrder)

exports.deletecardOrder = factory.deleteOne(cardOrder)

exports.updatecardOrder = factory.updateOne(cardOrder)
