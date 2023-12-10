const factory = require('./handlers')
const User = require('../models/userModel')




exports.createUser = factory.createOne(User);

exports.getUser = factory.getOne(User);

exports.getsUser = factory.getAll(User);

exports.deleteUser = factory.deleteOne(User);


