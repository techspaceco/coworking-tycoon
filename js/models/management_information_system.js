var ManagementInformationSystem;

(function () {
  ManagementInformationSystem = function () {
    var defaultCurrency = 'GBP';
    var maxSpaceArea = 0;
    var maxPricePerSquareFoot = 0;
    var monthlyChurn = [];
    var monthlyChurnVolume = 0;
    var monthlyLicenceFeeRevenue = 0;
    var monthlyLeads = [];
    var monthlyLeadVolume = 0;
    var monthlySales = [];
    var monthlySalesVolume = 0;
    var occupancy = null;
    var occupiedWorkstation = 0;
    var quarterlyRentBill = 0;
    var totalArea = 0;

    this.addLead = function (newLead) {
      monthlyLeads.push(newLead);

      var endOfPreviousMonthFound = false;

      monthlyLeads.forEach(function (lead, index) {
        var createdOn = lead.createdOn();
        var thirtyDaysAgo = new Date();
        thirtyDaysAgo.setTime(AppStore.date().getTime())
        Util.addDays(thirtyDaysAgo, -30);

        if (createdOn < thirtyDaysAgo) {
          monthlyLeads.splice(index, 1);
        } else if (createdOn === thirtyDaysAgo) {
          return;
        }
      });

      monthlyLeadVolume = 0;

      monthlyLeads.forEach(function (lead) {
        monthlyLeadVolume += lead.size();
      });

      return true;
    };

    this.addSale = function (newSale) {
      monthlySales.push(newSale);

      monthlySales.forEach(function (sale, index) {
        var closedOn = sale.closedOn();
        var thirtyDaysAgo = new Date();
        thirtyDaysAgo.setTime(AppStore.date().getTime())
        Util.addDays(thirtyDaysAgo, -30);

        if (closedOn < thirtyDaysAgo) {
          monthlySales.splice(index, 1);
        } else if (closedOn === thirtyDaysAgo) {
          return;
        }
      });

      monthlySalesVolume = 0;

      monthlySales.forEach(function (sale) {
        monthlySalesVolume += sale.size();
      });

      return true;
    };

    this.addToChurn = function (company) {
      monthlyChurn.push(company);

      return true;
    }

    this.monthlyBusinessRatesCost = function () {
      return parseInt(this.businessRatesRate() * totalArea / 12);
    };

    this.businessRatesRate = function () {
      return AppStore.businessRatesRate();
    };

    // TODO: Flux pattern
    this.clearOccupancyCache = function () {
      occupancy = null;
    };

    this.currency = function () {
      return defaultCurrency;
    };

    this.decorate = function () {
      return new ManagementInformationSystemDecorator(this);
    };

    this.density = function () {
      return AppStore.density();
    };

    this.foreCastCashLow = function () {
      var date = new Date();
      date.setTime(AppStore.date().getTime());

      var currentQuarter = Util.getQuarter(date);
      var newQuarter = currentQuarter;
      var monthsUntilNextQuarter = 0;

      while (newQuarter === currentQuarter) {
        date.setMonth(date.getMonth() + 1);
        newQuarter = Util.getQuarter(date);
        monthsUntilNextQuarter++;
      }

      var revenue = this.monthlyRevenue() * monthsUntilNextQuarter;
      var overheads = this.monthlyOverheads() * monthsUntilNextQuarter;

      return (
        AppStore.bankAccount().balance() +
        revenue -
        overheads -
        this.quarterlyRentBill()
      );
    };

    this.marketingLevelUpCost = function () {
      return AppStore.marketingLevelUpCost();
    };

    this.maxSpaceArea = function () {
      return maxSpaceArea;
    };

    this.maxPricePerSquareFoot = function () {
      return maxPricePerSquareFoot;
    };

    this.memberUserCount = function () {
      var count = 0;

      AppStore.spaces().forEach(function (space) {
        space.memberCompanies().forEach(function (company) {
          count += company.size();
        });
      });

      return count;
    };

    this.monthlyLicenceFeeRevenue = function () {
      return monthlyLicenceFeeRevenue;
    };

    this.monthlyOverheads = function () {
      return (
        this.monthlyBusinessRatesCost() +
        this.monthlyRepairsAndMaintenanceCost() +
        this.monthlyUtilitiesCost() +
        this.monthlyStaffCost()
      );
    };

    this.monthlyRevenue = function () {
      return this.monthlyLicenceFeeRevenue();
    };

    this.monthlyChurnRate = function () {
      return monthlyChurnVolume === 0 ? 0 : (
        monthlyChurnVolume / occupiedWorkstations
      );
    };

    this.monthlyLeadVolume = function () {
      return monthlyLeadVolume;
    };

    this.monthlySalesVolume = function () {
      return monthlySalesVolume;
    };

    this.grossMargin = function () {
      var revenue = this.monthlyRevenue();
      var costs = this.monthlyOverheads() + (this.quarterlyRentBill() / 3);

      return revenue === 0 ? 0 : (revenue - costs) / revenue;
    };

    this.occupancy = function () {
      var totalWorkstations = 0;

      occupiedWorkstations = 0;

      if (occupancy === null) {
        AppStore.spaces().forEach(function (space) {
          occupiedWorkstations += space.occupiedWorkstations();
          totalWorkstations += space.totalWorkstations();
        });
      }

      return occupiedWorkstations === 0 ? 0 : occupiedWorkstations / totalWorkstations;
    };

    this.quarterlyRentBill = function () {
      return quarterlyRentBill;
    };

    this.recalculateMonthlyChurn = function () {
      monthlyChurn.forEach(function (company, index) {
        var thirtyDaysAgo = new Date();
        thirtyDaysAgo.setTime(AppStore.date().getTime())
        Util.addDays(thirtyDaysAgo, -30);

        if (company.offboardedOn() < thirtyDaysAgo) {
          monthlyChurn.splice(index, 1);
        }
      });

      monthlyChurnVolume = 0;

      monthlyChurn.forEach(function (company) {
        monthlyChurnVolume += company.size();
      });
    };

    this.salesLevelUpCost = function () {
      return AppStore.salesLevelUpCost();
    }

    this.monthlyRepairsAndMaintenanceCost = function () {
      return parseInt(this.repairsAndMaintenanceRate() * totalArea / 12);
    };

    this.repairsAndMaintenanceRate = function () {
      return AppStore.repairsAndMaintenanceRate();
    };

    this.setMaxSpaceArea = function (area) {
      maxSpaceArea = area;
    };

    this.setMaxPricePerSquareFoot = function (price) {
      maxPricePerSquareFoot = price;
    };

    this.setMonthlyLicenceFeeRevenue = function (amount) {
      monthlyLicenceFeeRevenue = amount;

      return true;
    };

    this.setQuarterlyRentBill = function (amount) {
      quarterlyRentBill = amount;

      return true;
    };

    this.setTotalArea = function (area) {
      totalArea = area;
    };

    this.monthlyStaffCost = function () {
      return parseInt(this.staffRate() * totalArea / 12);
    };

    this.staffRate = function () {
      return AppStore.staffRate();
    };

    this.totalArea = function () {
      return totalArea;
    };

    this.monthlyUtilitiesCost = function () {
      return parseInt(this.utilitiesRate() * totalArea / 12);
    };

    this.utilitiesRate = function () {
      return AppStore.utilitiesRate();
    };

    this.workstationPrice = function () {
      return AppStore.workstationPrice();
    }
  };
})();
