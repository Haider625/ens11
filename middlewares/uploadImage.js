
const multer = require('multer');
const ApiError = require('../utils/apiError');

function multerOptions() {

  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Only Images allowed', 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter }); 
  return upload;
}

exports.uploadSingleImage = (fieldName) => {
  const upload = multerOptions().single(fieldName);

  // استخدم Multer داخل وسيط رفع الصور
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        console.error('Multer Error:', err);
        return res.status(500).json({ error: 'Error uploading image' });
      }
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
        return res.status(500).json({ error: 'Error uploading images' });
      }
      next();
    });
  };
};