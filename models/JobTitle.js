const mongoose = require('mongoose');

const jobTitleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [2, 'Too short name'],
            maxlength: [250, 'Too long name'],
            required: [true, 'name required'],
        },
       createdAt: {
            type :Date,
            default:Date.now()
        },
        
    },

);   

module.exports = mongoose.model('JobTitle',jobTitleSchema);

