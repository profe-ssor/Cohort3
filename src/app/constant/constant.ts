export const Constant = {
//  validation for forms

  // email validation regex
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneRegex: /^\d{10}$/,

   // min length validation
   minLength: 3,

   // max length validation
   maxLength: 50,



   // min length validation
   minPasswordLength: 5,

   // max length validation
   maxPasswordLength: 20,

   // min length validation
   minConfirmPasswordLength: 5,

   // max length validation
   maxConfirmPasswordLength: 20,

    //max length validation


 // validation messages

REQUIRED: 'This field is required',
EMAIL_INVALID: 'Please enter a valid email',
MIN_LENGTH: (min: number) => `Minimum length is ${min}`,
MAX_LENGTH: (max: number) => `Maximum length is ${max}`,
MIN_PASSWORD_LENGTH: (min: number) => `Minimum password length is ${min}`,
MAX_PASSWORD_LENGTH: (max: number) => `Maximum password length is ${max}`,
MIN_CONFIRM_PASSWORD_LENGTH: (min: number) => `Minimum confirm password length is ${min}`,
MAX_CONFIRM_PASSWORD_LENGTH: (max: number) => `Maximum confirm password length is ${max}`,
// honeRegex validation
HONE_REGEX_INVALID: 'Please enter a valid phone number',

}
