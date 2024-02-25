const mongoose = require('mongoose');

const wordTextSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [2, 'Too short name'],
            maxlength: [250, 'Too long name'],
            required: [true, 'name required'],
        },
        text: {
            type: [{
              type: String,
            }]
          }
    },
    { timestamps: true }
);   

module.exports = mongoose.model('text', wordTextSchema);
