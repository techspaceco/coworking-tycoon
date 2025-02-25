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
    var occupiedWorkstations = 0;
    var totalWorkstations = 0;
    var quarterlyRentBill = 0;
    var totalArea = 0;
    
    // Cache for expensive calculations
    var cache = {
      memberUserCount: null,
      monthlyOverheads: null,
      monthsUntilNextQuarter: null,
      foreCastCashLow: null,
      grossMargin: null
    };
    
    // Reset cache when data changes
    var resetCache = function() {
      for (var key in cache) {
        cache[key] = null;
      }
    };

    this.addLead = function (newLead) {
      monthlyLeads.push(newLead);
      
      // Use filter instead of splice to avoid array modification during iteration
      var thirtyDaysAgo = new Date();
      thirtyDaysAgo.setTime(AppStore.date().getTime());
      Util.addDays(thirtyDaysAgo, -30);
      
      monthlyLeads = monthlyLeads.filter(function(lead) {
        return lead.createdOn() >= thirtyDaysAgo;
      });

      // Calculate lead volume in a single pass
      monthlyLeadVolume = monthlyLeads.reduce(function(total, lead) {
        return total + lead.size();
      }, 0);

      return true;
    };

    this.addSale = function (newSale) {
      monthlySales.push(newSale);
      
      // Use filter instead of splice to avoid array modification during iteration
      var thirtyDaysAgo = new Date();
      thirtyDaysAgo.setTime(AppStore.date().getTime());
      Util.addDays(thirtyDaysAgo, -30);
      
      monthlySales = monthlySales.filter(function(sale) {
        return sale.closedOn() >= thirtyDaysAgo;
      });

      // Calculate sales volume in a single pass
      monthlySalesVolume = monthlySales.reduce(function(total, sale) {
        return total + sale.size();
      }, 0);

      return true;
    };

    this.addToChurn = function (company) {
      // Correctly capture company size in closure
      var size = company.size ? company.size() : (company._size || 1);
      var currentDate = new Date();
      currentDate.setTime(AppStore.date().getTime());
      
      var churnRecord = {
        size: function() { return size; },
        offboardedOn: function() { return currentDate; }
      };
      
      // Add to records but DON'T increment monthlyChurnVolume directly
      // This will be recalculated correctly in recalculateMonthlyChurn
      monthlyChurn.push(churnRecord);
      
      console.log("Added to churn: company of size " + size);
      
      // Immediately recalculate to get accurate numbers
      this.recalculateMonthlyChurn();
      
      resetCache();
      return true;
    }

    this.monthlyBusinessRatesCost = function () {
      return parseInt(this.businessRatesRate() * totalArea / 12);
    };

    this.businessRatesRate = function () {
      return AppStore.businessRatesRate();
    };

    // Clear occupancy cache and reset other cached values
    this.clearOccupancyCache = function () {
      occupancy = null;
      resetCache();
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
      if (cache.foreCastCashLow !== null) {
        return cache.foreCastCashLow;
      }
      
      if (cache.monthsUntilNextQuarter === null) {
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
        
        cache.monthsUntilNextQuarter = monthsUntilNextQuarter;
      }

      var revenue = this.monthlyRevenue() * cache.monthsUntilNextQuarter;
      var overheads = this.monthlyOverheads() * cache.monthsUntilNextQuarter;

      cache.foreCastCashLow = (
        AppStore.bankAccount().balance() +
        revenue -
        overheads -
        this.quarterlyRentBill()
      );
      
      return cache.foreCastCashLow;
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
      if (cache.memberUserCount !== null) {
        return cache.memberUserCount;
      }
      
      var count = 0;
      var spaces = AppStore.spaces();
      
      // Just sum up the totalSize from each space - much faster than accessing individual companies
      for (var i = 0; i < spaces.length; i++) {
        count += spaces[i].occupiedWorkstations();
      }
      
      cache.memberUserCount = count;
      return count;
    };

    this.monthlyLicenceFeeRevenue = function () {
      return monthlyLicenceFeeRevenue;
    };

    this.monthlyOverheads = function () {
      if (cache.monthlyOverheads !== null) {
        return cache.monthlyOverheads;
      }
      
      cache.monthlyOverheads = (
        this.monthlyBusinessRatesCost() +
        this.monthlyRepairsAndMaintenanceCost() +
        this.monthlyUtilitiesCost() +
        this.monthlyStaffCost()
      );
      
      return cache.monthlyOverheads;
    };

    this.monthlyRevenue = function () {
      return this.monthlyLicenceFeeRevenue();
    };

    this.monthlyChurnRate = function () {
      // If we have no members, return zero
      var totalMembers = this.memberUserCount();
      if (totalMembers === 0) {
        return 0;
      }
      
      // Recalculate to ensure we have fresh data
      this.recalculateMonthlyChurn();
      
      // Use 30-day rolling churn as monthly rate
      // This gives a proper percentage relative to current membership size
      var churnRate = monthlyChurnVolume / (totalMembers + monthlyChurnVolume);
      
      console.log("Monthly churn calculation: " + monthlyChurnVolume + " churned / " + 
                  "(" + totalMembers + " current members + " + monthlyChurnVolume + 
                  " churned members) = " + churnRate);
      
      return churnRate;
    };

    this.monthlyLeadVolume = function () {
      return monthlyLeadVolume;
    };

    this.monthlySalesVolume = function () {
      return monthlySalesVolume;
    };

    this.grossMargin = function () {
      if (cache.grossMargin !== null) {
        return cache.grossMargin;
      }
      
      var revenue = this.monthlyRevenue();
      var costs = this.monthlyOverheads() + (this.quarterlyRentBill() / 3);
      
      cache.grossMargin = revenue === 0 ? 0 : (revenue - costs) / revenue;
      return cache.grossMargin;
    };

    this.occupancy = function () {
      if (occupancy !== null) {
        return occupancy;
      }
      
      totalWorkstations = 0;
      occupiedWorkstations = 0;
      
      var spaces = AppStore.spaces();
      for (var i = 0; i < spaces.length; i++) {
        occupiedWorkstations += spaces[i].occupiedWorkstations();
        totalWorkstations += spaces[i].totalWorkstations();
      }
      
      occupancy = totalWorkstations === 0 ? 0 : occupiedWorkstations / totalWorkstations;
      return occupancy;
    };

    this.quarterlyRentBill = function () {
      return quarterlyRentBill;
    };

    this.recalculateMonthlyChurn = function () {
      var thirtyDaysAgo = new Date();
      thirtyDaysAgo.setTime(AppStore.date().getTime());
      Util.addDays(thirtyDaysAgo, -30);
      
      // Keep a limited history of churn records for reporting
      // We cap the size to improve performance with large properties
      var maxChurnRecords = 500;
      if (monthlyChurn.length > maxChurnRecords) {
        // Keep only the most recent records
        monthlyChurn = monthlyChurn.slice(monthlyChurn.length - maxChurnRecords);
      }
      
      // Use filter instead of splice to avoid array modification during iteration
      var previousLength = monthlyChurn.length;
      monthlyChurn = monthlyChurn.filter(function(company) {
        return company.offboardedOn() >= thirtyDaysAgo;
      });
      
      if (previousLength !== monthlyChurn.length) {
        console.log("Removed " + (previousLength - monthlyChurn.length) + 
                    " expired churn records, " + monthlyChurn.length + " remaining");
      }

      // Calculate churn volume in a single pass
      var previousVolume = monthlyChurnVolume;
      monthlyChurnVolume = monthlyChurn.reduce(function(total, company) {
        return total + company.size();
      }, 0);
      
      console.log("Monthly churn volume recalculated: " + previousVolume + " → " + monthlyChurnVolume);
      
      resetCache();
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
      resetCache();
    };

    this.setMaxPricePerSquareFoot = function (price) {
      maxPricePerSquareFoot = price;
      resetCache();
    };

    this.setMonthlyLicenceFeeRevenue = function (amount) {
      monthlyLicenceFeeRevenue = amount;
      resetCache();
      return true;
    };

    this.setQuarterlyRentBill = function (amount) {
      quarterlyRentBill = amount;
      resetCache();
      return true;
    };

    this.setTotalArea = function (area) {
      totalArea = area;
      resetCache();
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
