
const moment = require('moment');

 exports.addToOrderHistory = (updatedOrder, loggedInUserId, action, reason,days,hours,minutes,seconds, imgDone) => {
  updatedOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: action,
    reason: reason,
    operationTime:{
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    },
    imgDone : imgDone
  });
}


exports.calculateTimeDifference =(historys)=> {
    if (historys.length >= 0) {
        // نحسب الفارق بين آخر عمليتين في المجال
        const latestEditedAt = moment();
        const previousEditedAt = moment(historys[historys.length - 1].editedAt);
        const duration = moment.duration(latestEditedAt.diff(previousEditedAt));

        // نعيد كل وحدة زمنية بشكل منفصل
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        return { days, hours, minutes, seconds };
    } 
        return null; // أو أي قيمة تعبر عن عدم وجود تاريخ
    
}


// exports.messageNotification = (type,title,body,action,page,orderID,time) => {
//   const message = {
//     type :   type,
//     title : title,
//     body : body,
//     action: action,
//     page : page,
//     orderID: orderID,
//     time : time
//   }

//   return message
// }

