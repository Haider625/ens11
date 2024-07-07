
    exports.createDataSocket = (newOrder) => ({
        type: "new_order",
        title: "طلب جديد",
        body : `تم وصول طلب جديد من قبل ${newOrder.senderGroupName}`,
        action: "open_page",
        page : "home",
        orderID: newOrder._id,
        time : newOrder.updatedAt
        })

       exports.updatedatasocket = (updatOrder) => ({
       type: "order_update",
       title: "طلب جديد",
       body :`تم تعديل طلب من قبل ${updatOrder.senderGroupName}`,
       action: "open_page",
    page : "home",
    orderID: updatOrder._id,
    time : updatOrder.updatedAt
        })

    exports.forwordMessageSocket = (updatOrder) => ({
  type: "order_update",
  title: "طلب جديد",
  body : `تم وصول طلب جديد من قبل ${updatOrder.senderGroupName}`,
  action: "open_page",
  page : "onprase",
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
        })

       exports.acceptOrderMessageSocket = (updatOrder) => ({
  type: "order_update",
  title: "طلب جديد",
  body : `تم وصول طلب جديد من قبل ${updatOrder.senderGroupName}`,
  action: "open_page",
  page : "home",
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
        })



       exports.endWorkMessageSocket = (updatOrder) => ({
  type: "order_update",
  title: "طلب جديد",
  body : `تم وصول طلب جديد من قبل ${updatOrder.senderGroupName}`,
  action: "open_page",
  page : "onprase",
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
        })


    exports.confirmWorkMessageSocket = (updatOrder) => ({
    type: "order_update",
    title: "تاكيد الطلب",
    body : `اكذ انهاء العمل الذي تم من قبل ${updatOrder.senderGroupName}`,
    action: "open_page",
    page : "onprase",
    orderID: updatOrder._id,
    time : updatOrder.updatedAt
        })

       exports.confirmCompletionMessageSocket  = (updatOrder) => ({
  type: "order_update",
  title: "تاكيد الطلب",
  body : `تم تاكيد اتمام العمل من قبل ${updatOrder.senderGroupName}`,
  action: "open_page",
  page : "archive",
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
        })

    exports.rejectOrderMessageSocket = (updatOrder,page) => ({
    type: "order_update",
    title: "رفض الطلب",
    body : `تم رفض الطلب من قبل ${updatOrder.senderGroupName}`,
    action: "open_page",
    page : page,
    orderID: updatOrder._id,
    time : updatOrder.updatedAt
        })

       exports.rejectWorkMessageSocket = (updatOrder,page) => ({
  type: "order_update",
  title: "رفض الطلب",
  body : `تم رفض الطلب من قبل ${updatOrder.senderGroupName}`,
  action: "open_page",
  page : page,
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
        })


    exports.rejectConfirmWorkMessageSocket =(updatOrder,page) => ({
  type: "order_update",
  title: "تاكيد الطلب",
  body : `تم رفض التاكيد على الطلب من قبل ${updatOrder.senderGroupName}`,
  action: "open_page",
  page : page,
  orderID: updatOrder._id,
  time : updatOrder.updatedAt
        })

       exports.rejectConfirmMessageSocket = (updatOrder,page) => ({
    type: "order_update",
    title: "تاكيد الطلب",
    body : `تم رفض التاكيد على الطلب من قبل ${updatOrder.senderGroupName}`,
    action: "open_page",
    page : page,
    orderID: updatOrder._id,
    time : updatOrder.updatedAt
        })







 
// module.exports = {


//      updatedatasocket : {
//         message: {
//             title: "تم وصول طلب جديد"
//         }
//     },
//     acceptOrderMessageSocket : {
//         message: {
//             title: "تمت الموافقة على طلبك",
//             body : "تمت الموافقة من قبل"
//         }
//     },
//     startWorkMessageSocket : {
//         message: {
//             title: "تم البدء بالعمل على طلبك",
//             body : "تم بدء العمل من قبل"
//         }
//     },  
//     endWorkMessageSocket : {
//         message: {
//             title: "تم إنهاء العمل على طلبك",
//             body : "تم إنهاء العمل من قبل "
//         }
//     },
//     confirmWorkMessageSocket : {
//         message: {
//             title: "تم تأكيد اتمام عملك",
//             body : "تم تأكيد عملك من قبل"
//         }
//     },
//     forwordMessageSocket : {
//         message: {
//             title: "تم تحويل الطلب",
//             body : "تم تحويل طلبك الى"
//         }
//     },
//     rejectOrderMessageSocket : {
//         message: {
//             title: "تم رفض طلبك !" ,
   
//         }
//     },
//     rejectWorkMessageSocket : {
//         message: {
//             title: "تم رفض العمل على طلبك !",
   
//         }
//     },
//     rejectConfirmMessageSocket : {
//         message: {
//             title: "عملك مرفوض أو غير مكتمل !",
       
//         }
//     },

    
    
// }