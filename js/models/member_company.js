var MemberCompany;

(function () {
  MemberCompany = function (options) {
    var offboardedOn;
    var size = options.size;
    var workstationPrice = options.workstationPrice;
    var active = true; // Whether this company is still active (not churned)

    this.licenceFee = function () {
      return workstationPrice * size;
    };

    this.offboardedOn = function () {
      return offboardedOn;
    };
    
    this.isActive = function() {
      return active;
    };
    
    // Reactivate a cached company for reuse
    this.activate = function(newWorkstationPrice) {
      workstationPrice = newWorkstationPrice;
      offboardedOn = undefined;
      active = true;
      return this;
    };
    
    // Mark a company as inactive for potential reuse
    this.deactivate = function() {
      active = false;
      return this;
    };

    this.setOffboardedOn = function (date) {
      var newDate = new Date();
      newDate.setTime(date.getTime());
      offboardedOn = newDate;
      this.deactivate(); // Mark for reuse when offboarded
      return true;
    };

    this.size = function () {
      return size;
    };
    
    // This method is now handled by the Space's statistical churn model
    // But keep it for compatibility with existing code
    this.wantsToLeave = function () {
      // TODO: Add more factors and weightings
      var churnFactor = 0.00007; // Higher for more churn

      var dailyChurn = (
        churnFactor *
        AppStore.densityFactor() *
        AppStore.workstationPrice() /
        AppStore.repairsAndMaintenanceRate()
      );

      return Math.random() < dailyChurn;
    }
  };
})();
