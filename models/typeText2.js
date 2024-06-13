const mongoose = require('mongoose');

const typeText2Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [1, 'Too short name'],
            maxlength: [150, 'Too long name'],
            required: [true, 'name required'],
        },
        perntId :{
            type : mongoose.Schema.ObjectId,
            ref : 'typeText1',
        },
        DataText3 :[{
            type : String,
        }],

        FastOrder : Boolean ,

        createdAt: {
            type :Date,
            default:Date.now(),
            select : false
          },
    },

);   
// typeText2Schema.pre(/^find/, function (next) {
//     this.populate({
//       path: 'typeText3',
//       select: 'name ',
//     })
//     next();
// });
module.exports = mongoose.model('typeText2', typeText2Schema);
