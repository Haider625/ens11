const mongoose = require('mongoose');

const wordTextSchema = new mongoose.Schema(
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

module.exports = mongoose.model('text', wordTextSchema);
