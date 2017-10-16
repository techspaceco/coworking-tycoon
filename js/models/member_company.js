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
      let densityFactor = AppStore.defaultDensity() / AppStore.density();

      // TODO: Add more factors and weightings
      var churnFactor = 0.00007; // Higher for more churn
      var dailyChurn = (
        churnFactor *
        densityFactor *
        AppStore.workstationPrice() /
        AppStore.repairsAndMaintenanceRate()
      );

      return Math.random() < dailyChurn;
    }
  };
})();
