const mongoose = require('mongoose');

const typeText3Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            minlength: [5, 'Too short name'],
            maxlength: [100, 'Too long name'],
            required: [true, 'name required'],
        },
    },
    { timestamps: true }
);   

module.exports = mongoose.model('typeText3', typeText3Schema);
