const orderRout = require('./orderRoute')
const UserRout = require('./userRoute')
const authRout = require('./auth');
const groupUser = require('./groupUserRoute')
const accept = require('./acceptRout')
const wordText = require('./wordTextRout')
const viewGroup = require('./viewGroupRout')
const Archive = require('./archiveRout')
const reject = require('./rejectRoute')
const forword = require('./forwordRout')
const typeText1 = require('./typeText1Rout')
const typeText2 = require('./typeText2Rout')
const typeText3 = require('./typeText3Rout')
const messageSocket = require('./SocketData')
const AllOrder = require('./AllOrder')
const FilterData = require('./getDataFilter')

const mountRoutes = (app) => {

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
app.use('/api/v1/AllOrder',AllOrder)
app.use('/api/v1/FilterData',FilterData)


}


module.exports  = mountRoutes;