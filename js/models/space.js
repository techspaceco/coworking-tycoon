var Space;

(function () {
  Space = function (options) {
    var lease = options.lease;
    var density = options.density;
    var area = options.lease.area();
    var memberCompanies = [];

    this.area = function () {
      return this.lease().area();
    };

    this.availableWorkstations = function () {
      return this.totalWorkstations() - this.occupiedWorkstations();
    };

    this.hasAvailabilityFor = function (size) {
      return this.availableWorkstations() >= size;
    };

    this.lease = function () {
      return lease;
    };

    this.memberCompanies = function () {
      return memberCompanies;
    };

    this.monthlyBillTotal = function () {
      return area * (
        AppStore.businessRatesRate() +
        AppStore.repairsAndMaintenanceRate() +
        AppStore.utilitiesRate() +
        AppStore.staffRate()
      ) / 12;
    };

    this.occupancy = function () {
      this.occupiedWorkstations() / this.totalWorkstations();
    };

    this.occupiedWorkstations = function () {
      var num = 0;

      memberCompanies.forEach(function (company) {
        num += company.size();
      });

      return num;
    };

    // TODO: Move to service
    this.offboard = function (company) {
      memberCompanies.forEach(function (candidateCompany, index) {
        if (company === candidateCompany) {
          memberCompanies.splice(index, 1);
          company.setOffboardedOn(AppStore.date());

          // TODO: Flux pattern
          mis = AppStore.managementInformationSystem();
          mis.clearOccupancyCache();
          mis.addToChurn(company);
        }
      });

      return true;
    };

    // TODO: Move to service
    this.onboard = function (company) {
      memberCompanies.push(company);

      return true;
    };

    this.quarterlyRent = function () {
      return this.lease().quarterlyRent();
    };

    this.totalWorkstations = function () {
      return Math.floor(area / density);
    };
  };
})();
