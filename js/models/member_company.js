var MemberCompany;

(function () {
  MemberCompany = function (options) {
    var offboardedOn;
    var size = options.size;
    var workstationPrice = options.workstationPrice;

    this.licenceFee = function () {
      return workstationPrice * size;
    };

    this.offboardedOn = function () {
      return offboardedOn;
    };

    this.setOffboardedOn = function (date) {
      var newDate = new Date();
      newDate.setTime(date.getTime())
      offboardedOn = newDate;

      return true;
    };

    this.size = function () {
      return size;
    };

    this.wantsToLeave = function () {
      // TODO: Add factors
      var dailyChurn = 0.002;
      return Math.random() < dailyChurn;
    }
  };
})();
