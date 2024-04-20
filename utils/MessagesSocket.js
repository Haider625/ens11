

module.exports = {

     createDataSocket :{
        message: {
            title: "تم وصول طلب جديد"
        },
    },
     updatedatasocket : {
        message: {
            title: "تم وصول طلب جديد"
        }
    },
    acceptOrderMessageSocket : {
        message: {
            title: "تمت الموافقة على طلبك",
            body : "تمت الموافقة من قبل"
        }
    },
    startWorkMessageSocket : {
        message: {
            title: "تم البدء بالعمل على طلبك",
            body : "تم بدء العمل من قبل"
        }
    },  
    endWorkMessageSocket : {
        message: {
            title: "تم إنهاء العمل على طلبك",
            body : "تم إنهاء العمل من قبل "
        }
    },
    confirmWorkMessageSocket : {
        message: {
            title: "تم تأكيد اتمام عملك",
            body : "تم تأكيد عملك من قبل"
        }
    },
    forwordMessageSocket : {
        message: {
            title: "تم تحويل الطلب",
            body : "تم تحويل طلبك الى"
        }
    },
    rejectOrderMessageSocket : {
        message: {
            title: "تم رفض طلبك !" ,
   
        }
    },
    rejectWorkMessageSocket : {
        message: {
            title: "تم رفض العمل على طلبك !",
   
        }
    },
    rejectConfirmMessageSocket : {
        message: {
            title: "عملك مرفوض أو غير مكتمل !",
       
        }
    },

    
    
}