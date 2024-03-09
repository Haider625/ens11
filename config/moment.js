// Import moment.js
// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment-timezone');

// Set the timezone to Asia/Baghdad
moment.tz.setDefault('Asia/Baghdad');

// Function to return the formatted date and time
function getFormattedDate() {
  return moment().format('YYYY-MM-DD HH:mm');
}

// Example of using the function
// console.log(getFormattedDate()); // Outputs the current date and time in the Iraq timezone

// Override Date.now to return the current timestamp
Date.now = function() {
  return new Date().getTime() + (3 * 60 * 60 * 1000); // إضافة 3 ساعات بالميلي ثانية
};
// const timestamp = Date.now();
// const date = new Date(timestamp);
// console.log(date);
; 
// Export the function
module.exports = {
  getFormattedDate,
};
