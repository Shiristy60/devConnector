const Validator = require('validator');
const isEmpty = require('./is-empty');

const validatePostInput = (data) => {

    data.text = isEmpty(data.text) ? '' : data.text;

    let errors = {};
    
    if(!Validator.isLength(data.text, {min: 10, max: 300})) {
        errors.text = 'Text should be between 10 and 300 characters'
    }
    if(Validator.isEmpty(data.text)) {
        errors.text = 'Text field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}
module.exports = validatePostInput;