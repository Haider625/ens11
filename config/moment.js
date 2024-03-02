const moment = require('moment');

module.exports = {
  convertToLocaleTime: function(utcTime) {
    // تحديد الفارق الزمني إلى +3:00 ساعات
    return moment.utc(utcTime).utcOffset('+03:00').format('YYYY-MM-DDTHH:mm');
  }
};
