/* eslint-disable import/no-extraneous-dependencies */

const path = require('path')
const http = require('http');
const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');
const cron = require('node-cron');
// const rateLimit = require('express-rate-limit');
const  mongoSanitize  =  require ( 'express-mongo-sanitize' ) ;
const xss = require('xss-clean')

const dbconnection = require('./config/database');
const ApiError = require('./utils/apiError')
const globalError = require('./middlewares/errmiddlware')

const orderRout = require('./routes/orderRoute')
const UserRout = require('./routes/userRoute')
const authRout = require('./routes/auth');
const groupUser = require('./routes/groupUserRoute')
const accept = require('./routes/acceptRout')
const wordText = require('./routes/wordTextRout')
const viewGroup = require('./routes/viewGroupRout')
const Archive = require('./routes/archiveRout')
const reject = require('./routes/rejectRoute')
const forword = require('./routes/forwordRout')
const typeText1 = require('./routes/typeText1Rout')
const typeText2 = require('./routes/typeText2Rout')
const typeText3 = require('./routes/typeText3Rout')
const messageSocket = require('./routes/SocketData')

const { cronTask } = require('./serves/SocketData');

const socketHandler = require('./utils/socket');

const app = express();

const server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname,'uploads')));

dotenv.config({path: 'config.env'})

dbconnection();

cron.schedule('* */1000 * * *', cronTask);


if(process.env.NODE_ENV === 'devlopment') {
    app.use(morgan('dev'));
    console.log(`node : ${process.env.NODE_ENV}`)
}
// To remove data using these defaults:
app.use(mongoSanitize());
app.use(xss())

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 5,
//     message: 'Too many accounts created from this IP, please try again after an hour',
// });

// app.use('/api', limiter);

app.use('/api/v1/order',orderRout) 
app.use('/api/v1/user',UserRout) 
app.use('/api/v1/auth',authRout) 
app.use('/api/v1/group',groupUser) 
app.use('/api/v1/accept',accept)
app.use('/api/v1/word',wordText) 
app.use('/api/v1/viewGroup',viewGroup) 
app.use('/api/v1/Archive',Archive) 
app.use('/api/v1/reject',reject) 
app.use('/api/v1/forword',forword)
app.use('/api/v1/typeText1',typeText1)
app.use('/api/v1/typeText2',typeText2)
app.use('/api/v1/typeText3',typeText3)
app.use('/api/v1/messageSocket',messageSocket)

app.all('*',(req,res,next) => {
    next(new ApiError(`can t find this route : ${req.originalUrl}`, 404));
 })

socketHandler.initializeSocket(server);

app.use(globalError) ;


const PORT = process.env.PORT || 6000 ;
 server.listen(PORT , () => {
    console.log(`App running on port :${PORT}`);

});


process.on(`unhandledRejection`,(err) =>{
    console.error(`UnhandledRejection Error : ${err.name} | ${err.massage}`);
    server.close(( ) => {
        console.error('shutting down...');
        process.exit(1);

    });
    
});
module.exports = server ;