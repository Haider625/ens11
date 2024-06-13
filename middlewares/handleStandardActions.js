


 exports.addToOrderHistory = (updatedOrder, loggedInUserId, action, reason, imgDone) => {
  updatedOrder.history.push({
    editedAt: Date.now(),
    editedBy: loggedInUserId,
    action: action,
    reason: reason,
    imgDone : imgDone
  });
}


exports.messageNotification = (type,title,body,action,page,orderID,time) => {
  const message = {
    type :   type,
    title : title,
    body : body,
    action: action,
    page : page,
    orderID: orderID,
    time : time
  }

  return message
}

