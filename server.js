const path = require('path')

const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');

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

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname,'uploads')));

dotenv.config({path: 'config.env'})

dbconnection();


if(process.env.NODE_ENV === 'devlopment') {
    app.use(morgan('dev'));
    console.log(`node : ${process.env.NODE_ENV}`)
}

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