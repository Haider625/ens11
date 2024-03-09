const mongoose = require('mongoose');

const typeText1Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [1, 'Too short name'],
            maxlength: [150, 'Too long name'],
            required: [true, 'name required'],
        },
        createdAt: {
            type :Date,
            default:Date.now()
          },
    },

);   

module.exports = mongoose.model('typeText1', typeText1Schema);

