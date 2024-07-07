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
const {getFormattedDate} =  require('./config/moment')

const  mountRoutes = require('./routes')

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

mountRoutes(app);

app.all('*',(req,res,next) => {
    next(new ApiError(`can t find this route : ${req.originalUrl}`, 404));
 })

socketHandler.initializeSocket(server);

app.use(globalError) ;

app.use(getFormattedDate)

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