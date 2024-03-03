// استيراد moment.js
// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment-timezone');

// تحديد المنطقة الزمنية للعراق
moment.tz.setDefault('Asia/Baghdad');

// دالة لإظهار السنة و الشهر و اليوم و الساعة و الدقيقة
function getFormattedDate() {
  return moment().format('YYYY-MM-DD HH:mm');
}

// مثال على استخدام الدالة
console.log(getFormattedDate()); // سيُخرج التاريخ والوقت الحاليين بتوقيت العراق

// تصدير الدالة
module.exports = {
  getFormattedDate,
};
