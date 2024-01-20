const mongoose = require('mongoose');

const groupUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [3, 'Too short name'],
            maxlength: [32, 'Too long name'],
            required: [true, 'name required'],
        },
        level : {
            type : Number,
            // unique: true,
            // maxlength: [6, 'Too long level'],
            // required: [true, 'level required'],
        },
        inlevel : {
            type : Number,
        }
    },
    { timestamps: true }
);   
module.exports = mongoose.model('group', groupUserSchema);