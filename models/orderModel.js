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
            type : Boolean ,
            default : false
        },
        image : String
    },
    { timestamps: true }
)
module.exports = mongoose.model('order',orderSchema);