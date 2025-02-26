var Util = {
  addDay: function (t) {
    Util.addDays(t, 1);
  },

  addDays: function (t, n) {
    t.setDate(t.getDate() + n);
  },

  formatDate: function (date) {
    var monthNames = [
      'January', 'February', 'March',
      'April', 'May', 'June', 'July',
      'August', 'September', 'October',
      'November', 'December'
    ];
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
  
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  },

  // Oct-Dec = 1
  // Jan-Mar = 2
  // Apr-Jun = 3
  // Jul-Sep = 4
  getQuarter: function (d) {
    var quarter = Math.floor(d.getMonth() / 3) + 2;

    quarter = quarter > 4 ? quarter - 4 : quarter;

    return quarter;
  },

  htmlCurrencySymbolMap: {
    'GBP': '£'
  },

  numberWithCommas: function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  timer: function (name) {
    var start = new Date();

    return {
      stop: function() {
        var end = new Date();
        var time = end.getTime() - start.getTime();
        console.log('Timer:', name, 'finished in', time, 'ms');
      }
    };
  }
};
