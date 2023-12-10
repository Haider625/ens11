/* eslint-disable import/no-extraneous-dependencies */
const express = require("express");
const dotenv = require("dotenv")

const morgan = require('morgan')

const dbconnection = require('./config/database');
const ApiError = require('./utils/apiError')
const globalError = require('./middlewares/errmiddlware')

const orderRout = require('./routes/orderRoute')
const UserRout = require('./routes/userRoute')
const authRout = require('./routes/auth')

const app = express();
app.use(express.json());

dotenv.config({path: 'config.env'})

dbconnection();


if(process.env.NODE_ENV === 'devlopment') {
    app.use(morgan('dev'));
    console.log(`node : ${process.env.NODE_ENV}`)
}



app.use('/api/order',orderRout)
app.use('/api/user',UserRout)
app.use('/api/auth',authRout)


app.get('/',(req,res)=>{
    res.send('sdjf');
})

app.all('*',(req,res,next) => {
    next(new ApiError(`can t find this route : ${req.originalUrl}`, 400))
 })

app.use(globalError)

const PORT = process.env.PORT || 6000
 const server = app.listen(PORT , () => {
    console.log(`App running on port :${PORT}`);
})

process.on(`unhandledRejection`,(err) =>{
    console.error(`UnhandledRejection Error : ${err.name} | ${err.massage}`);
    server.close(( ) => {
        console.error('shutting down...');
        process.exit(1);

    });
    
});
module.exports = server ;