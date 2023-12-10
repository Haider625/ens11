const mongoose = require("mongoose");

const database = () => {
    
mongoose
.connect(process.env.DB_URI)
.then(() => {
    console.log(`database connected`);
})

};
module.exports = database ;