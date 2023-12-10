// eslint-disable-next-line import/no-extraneous-dependencies
const {validationResult} = require('express-validator')

const validatormiddl = (req,res,next) => {

        const errors= validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        next();
    }
    module.exports = validatormiddl