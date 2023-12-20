const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        title:{
            type :String,
           
        },
        caption :{
            type : String
        },
        materialName : {
            type : String
        },
        type :{
            type : String
        },
        State :{
            type : String,
            enum : ['accept', 'reject', 'onprase'],
            default : 'onprase'
        },
        image : String
    },
    { timestamps: true }
)
module.exports = mongoose.model('order',orderSchema);