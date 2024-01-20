// const { forwordReject } = require("./reject");



// exports.forwordReject =  asyncHandler(async(req,res,next) =>{

// }




// 
//     const loggedInUserId = req.user._id;
//     const {group} = req.body   
//     const userforword= await orders.findByIdAndUpdate(
//         req.params.id,
//         // req.body,
//        {group},
//         {new: true,});
//         userforword.State = "onprase"
//     if (!userforword) {
//         return next(new ApiError(`No forword for this id`, 404));
//       }
//       userforword.history.push({
//             editedAt: Date.now(),
//             editedBy: loggedInUserId,
//             action: `تم تحويل طلبك إلى ${group}`
//           });
//       res.status(200).json({ data: userforword });
//   });