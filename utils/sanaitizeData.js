// exports.sanitizeUser = function (user) {
//     return {
//         id : user._id,
//         name : user.name,
//         userId : user.userId,
//     }
// }

// exports.sanitizeOrder = function (order) {
    
//     return {
//         id :order._id,
//         type1: order.type1,
//         type2: order.type2,
//         type3: order.type3,
//         number: order.number,
//         caption: order.caption,
//         orderimg: order.orderimg,
//         donimgs: order.donimgs,
//         State: order.State,
//         StateReasonAccept: order.StateDoneReasonAccept,
//         StateReasonReject: order.StateDoneReasonReject,
//         StateReasonOnprase: order.StateReasonOnprase,
//         StateWork: order.StateWork,
//         StateWorkReasonAccept: order.StateWorkReasonAccept,
//         StateWorkReasonReject: order.StateWorkReasonReject,
//         StateDone: order.StateDone,
//         StateDoneReasonAccept: order.StateDoneReasonAccept,
//         StateDoneReasonReject: order.StateDoneReasonReject,
//         createdBy: {
//             _id: order.createdBy._id,
//             name: order.createdBy.name,
//             userId: order.createdBy.userId,
//             jobTitle: order.createdBy.jobTitle,
//             school: order.createdBy.school,
//             image: order.createdBy.image
//         },
//         createdAt:order.createdAt,
//         history:order.history
//     }
// }