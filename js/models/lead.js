var Lead;

(function () {
  Lead = function (options) {
    var size = options.size;
    var closedOn, createdOn;

    this.closedOn = function () {
      return closedOn;
    };

    this.createdOn = function () {
      return createdOn;
    };

    this.setClosedOn = function (date) {
      var newDate = new Date();
      newDate.setTime(date.getTime())
      closedOn = newDate;

      return true;
    };

    this.setCreatedOn = function (date) {
      var newDate = new Date();
      newDate.setTime(date.getTime())
      createdOn = newDate;

      return true;
    };

    this.size = function () {
      return size;
    };

    this.setCreatedOn(AppStore.date());
  };
})();
