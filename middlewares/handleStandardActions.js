
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

        const latestEditedAt = moment();
        const previousEditedAt = moment(historys[historys.length - 1].editedAt);
        const duration = moment.duration(latestEditedAt.diff(previousEditedAt));

        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        return { days, hours, minutes, seconds };
    } 
        return null;
    
}

exports.setOrderDetails= (order,user) =>{
  order. senderGroupId = user.group._id;
  order. senderGroupName  = user.group.name;
  order.updatedAt =Date.now()
}


