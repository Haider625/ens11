// exports.sanitizeUser = function (user) {
//     return {
//         id : user._id,
//         name : user.name,
//         userId : user.userId,
//     }
// }

exports.sanitizeOrder = function (order) {
    
    return {
        id :order._id,
        type1: order.type1,
        type2: order.type2,
        type3: order.type3,
        number: order.number,
        caption: order.caption,
        orderimg: order.orderimg,
        donimgs: order.donimgs,
        FastOrder : order.FastOrder,
        State: order.State,
        // StateReasonAccept: order.StateDoneReasonAccept,
        // StateReasonReject: order.StateDoneReasonReject,
        // StateReasonOnprase: order.StateReasonOnprase,
        StateWork: order.StateWork,
        // StateWorkReasonAccept: order.StateWorkReasonAccept,
        // StateWorkReasonReject: order.StateWorkReasonReject,
        StateDone: order.StateDone,
        // StateDoneReasonAccept: order.StateDoneReasonAccept,
        // StateDoneReasonReject: order.StateDoneReasonReject,
        users : order.users,
        createdBy: {
            _id: order.createdBy._id,
            name: order.createdBy.name,
            userId: order.createdBy.userId,
            jobTitle: order.createdBy.jobTitle,
            school: order.createdBy.school,
            image: order.createdBy.image  

        },
        createrGroup : order.createrGroup, 
        senderOrder : order.senderOrder,
        createdAt:order.createdAt,
        updatedAt : order.updatedAt,
        history:order.history,
        editedBy :order.history.editedBy

    }
}

exports.sanitizeType1 = function (typeText1) {
        return {
        id : typeText1._id,
        name : typeText1.name,
        DataText2 : typeText1.DataText2,
    }
}