const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateExperienceInput = (data) => {

    data.title = isEmpty(data.title) ? '' : data.title;
    data.company = isEmpty(data.company) ? '' : data.company;
    data.from = isEmpty(data.from) ? '' : data.from;

    let errors = {};
    
    if(Validator.isEmpty(data.title)) {
        errors.title = 'Job title field is required';
    }
    if(Validator.isEmpty(data.company)) {
        errors.company = 'Company field is required';
    }
    if(Validator.isEmpty(data.from)) {
        errors.from = 'From datefield is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}
module.exports = validateExperienceInput;