const mongoose = require('mongoose');

mongoose.options.toJSON = { transform : function(doc, ret, options) { 
     delete ret._id;
     delete ret.__v; // return ret;
},
 virtuals: true }

const typeText1Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [1, 'Too short name'],
            maxlength: [150, 'Too long name'],
            required: [true, 'name required'],
        },
        DataText2 :[{
            type : mongoose.Schema.ObjectId,
            ref : 'typeText2',
        }],
        createdAt: {
            type :Date,
            default:Date.now(),
            select : false
          },
    },

);   
// typeText1Schema.pre(/^find/, function (next) {
//     this.populate({
//       path: 'typeText1',
//       select: 'name ',
//     })
//     next();
// });

module.exports = mongoose.model('typeText1', typeText1Schema);

