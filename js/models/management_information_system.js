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
    var quarterlyRentBill = 0;
    var totalArea = 0;

    this.addLead = function (newLead) {
      monthlyLeads.push(newLead);

      return true;
    };

    this.addSale = function (newSale) {
      monthlySales.push(newSale);

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
    }

    this.monthlyLicenceFeeRevenue = function () {
      return monthlyLicenceFeeRevenue;
    };

    this.monthlyOverheads = function () {
      return (
        this.monthlyBusinessRatesCost() +
        this.monthlyRepairsAndMaintenanceCost() +
        this.monthlyUtilitiesCost() +
        this.monthlyStaffCost() +
        this.monthlyProjectCosts()
      );
    };

    this.monthlyRevenue = function () {
      return this.monthlyLicenceFeeRevenue();
    };

    this.monthlyChurnVolume = function () {
      return monthlyChurnVolume;
    };

    this.monthlyLeadVolume = function () {
      return monthlyLeadVolume;
    };

    this.monthlyProjectCosts = function () {
      return ProjectStore.monthlyProjectCosts();
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
      var occupiedWorkstations = 0;
      var totalWorkstations = 0;

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

    this.recalculateMonthlyLeads = function () {
      monthlyLeads.forEach(function (lead, index) {
        var thirtyDaysAgo = new Date();
        thirtyDaysAgo.setTime(AppStore.date().getTime())
        Util.addDays(thirtyDaysAgo, -30);

        if (lead.createdOn() < thirtyDaysAgo) {
          monthlyLeads.splice(index, 1);
        }
      });

      monthlyLeadVolume = 0;

      monthlyLeads.forEach(function (lead) {
        monthlyLeadVolume += lead.size();
      });
    };

    this.recalculateMonthlySales = function () {
      monthlySales.forEach(function (sale, index) {
        var thirtyDaysAgo = new Date();
        thirtyDaysAgo.setTime(AppStore.date().getTime())
        Util.addDays(thirtyDaysAgo, -30);

        if (sale.closedOn() < thirtyDaysAgo) {
          monthlySales.splice(index, 1);
        }
      });

      monthlySalesVolume = 0;

      monthlySales.forEach(function (sale) {
        monthlySalesVolume += sale.size();
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
