
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../utils/apiError');

function multerOptions() {

  const multerStorage = multer.diskStorage({
      destination : function (req,file , cb) {
        
        cb(null, 'uploads/test')
      },
      // filename : function (req,file,cb) {
      //   // const ext = file.mimetype.split('/')[1];
       
      //     cb(null, `${file.fieldname  }-${  uuidv4()  }-${  Date.now()  }.jpeg`);
        
      // },
    });

  // const multerFilter = function (req, file, cb) {
  //   if (file.mimetype.startsWith('image')) {
  //     cb(null, true);
  //   } else {
  //     cb(new ApiError('Only Images allowed', 400), false);
  //   }
  // };

  const upload = multer({ 
    storage: multerStorage,
     //fileFilter: multerFilter 
  }); 
  return upload;
}

exports.uploadSingleImage = (fieldName) => {
  const upload = multerOptions().single(fieldName);

  // استخدم Multer داخل وسيط رفع الصور
  return (req, res, next) => {
    upload(req, res, (err) => {
      // if (err) {
      //   console.error('Multer Error:', err);
      //   return res(new ApiError('Only Images allowed', 400), false);
      // }
      next();
    });
  };
};

exports.uploadMixOfImages = (arrayOfFields) => {
  const upload = multerOptions().fields(arrayOfFields);

  // استخدم Multer داخل وسيط رفع الصور
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        console.error('Multer Error:', err);
        return res.status(500).json({ error: `Error uploading images` });
      }
      next();
    });
  };
};