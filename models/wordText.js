const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const wordTextSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [2, 'Too short name'],
            maxlength: [250, 'Too long name'],
            required: [true, 'name required'],
        },
        group:{
          type: mongoose.Schema.ObjectId,
          ref: 'group',
        },
        text: {
            type: [{
              type: String,
            }]
        },
        createdAt: {
            type :Date,
            default:Date.now()
        },
        
    },

);   
wordTextSchema.plugin(mongoosePaginate);
// wordTextSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'group',
//     select: '_id name',
//     options: { depth: 1 }
//   });
//   next();
// });


module.exports = mongoose.model('text', wordTextSchema);
