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
    var npsScore = 50; // Start with a neutral NPS
    
    // Event-related multipliers
    var leadMultiplier = 1;
    var leadMultiplierEndDate = null;
    var churnMultiplier = 1;
    var churnMultiplierEndDate = null;
    var npsBoost = 0;
    var npsBoostEndDate = null;
    var overheadMultiplier = 1;
    var overheadMultiplierEndDate = null;
    var temporaryMembers = 0;
    var temporaryMembersEndDate = null;
    var npsFeedback = ""; // Current top issue affecting NPS
    var communityEventsPerMember = 0; // Community events budget per member per month (in £)
    
    // Staff-related benefits
    function getStaffBenefits() {
      if (typeof StaffStore !== 'undefined') {
        return StaffStore.getStaffBenefits();
      }
      return {
        npsBoost: 0,
        churnReduction: 0,
        eventBudgetDiscount: 0,
        overheadReduction: 0,
        maintenanceCostReduction: 0,
        spaceUtilizationBoost: 0,
        salesBoost: 0,
        conversionRateBoost: 0,
        premiumPricingBoost: 0,
        leadBoost: 0,
        brandValueBoost: 0,
        marketingEfficiencyBoost: 0,
        memberSatisfactionBoost: 0,
        operationalEfficiencyBoost: 0,
        techSupportBoost: 0
      };
    }
    
    // Apply staff benefits to a value based on benefit type
    function applyStaffBenefit(value, benefitType) {
      var benefits = getStaffBenefits();
      
      if (!benefits[benefitType]) {
        return value; // No benefit of this type
      }
      
      switch (benefitType) {
        // Additive benefits (direct addition to values)
        case 'npsBoost':
          return value + benefits[benefitType];
        
        // Multiplicative benefits (percentage changes)
        case 'churnReduction':
          return value * (1 - benefits[benefitType]);
        case 'eventBudgetDiscount':
          return value * (1 - benefits[benefitType]);
        case 'overheadReduction':
          return value * (1 - benefits[benefitType]);
        case 'maintenanceCostReduction':
          return value * (1 - benefits[benefitType]);
        case 'salesBoost':
          return value * (1 + benefits[benefitType]);
        case 'conversionRateBoost':
          return value * (1 + benefits[benefitType]);
        case 'premiumPricingBoost':
          return value * (1 + benefits[benefitType]);
        case 'leadBoost':
          return value * (1 + benefits[benefitType]);
        case 'brandValueBoost':
          return value * (1 + benefits[benefitType]);
        case 'marketingEfficiencyBoost':
          return value * (1 + benefits[benefitType]);
        case 'spaceUtilizationBoost':
          return value * (1 + benefits[benefitType]);
        case 'memberSatisfactionBoost':
          return value * (1 + benefits[benefitType]);
        case 'operationalEfficiencyBoost':
          return value * (1 + benefits[benefitType]);
        case 'techSupportBoost':
          return value * (1 + benefits[benefitType]);
        default:
          return value;
      }
    }
    
    // Store financial history - limited to last 12 data points
    var financialHistory = {
      revenue: [],
      bankBalance: [],
      cashLow: [],
      profit: [],
      maxItems: 12
    };
    
    // Cache for expensive calculations
    var cache = {
      memberUserCount: null,
      monthlyOverheads: null,
      monthsUntilNextQuarter: null,
      foreCastCashLow: null,
      grossMargin: null,
      monthlyOfficeManagerCost: null,
      monthlyCommunityEventsCost: null
    };
    
    // Reset cache when data changes
    var resetCache = function() {
      for (var key in cache) {
        cache[key] = null;
      }
    };
    
    // Expose cached values for decorator (needed for community events cost display)
    this._getCachedValues = function() {
      return cache;
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
      
      // Apply overhead reduction from staff benefits
      var staffBenefits = getStaffBenefits();
      var overheadReduction = staffBenefits.overheadReduction || 0;
      
      // Apply the overhead reduction (capped at 50%)
      cache.monthlyOverheads = Math.round(cache.monthlyOverheads * (1 - Math.min(overheadReduction, 0.5)));
      
      // Apply the event-related overhead multiplier
      cache.monthlyOverheads = Math.round(cache.monthlyOverheads * overheadMultiplier);
      
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
      
      // Apply event-based churn multiplier
      churnRate = churnRate * churnMultiplier;
      
      // Apply staff churn reduction benefit
      var staffBenefits = getStaffBenefits();
      var churnReduction = staffBenefits.churnReduction || 0;
      
      // Apply the churn reduction (capped at 90% reduction)
      churnRate = churnRate * (1 - Math.min(churnReduction, 0.9));
      
      console.log("Monthly churn calculation: " + monthlyChurnVolume + " churned / " + 
                  "(" + totalMembers + " current members + " + monthlyChurnVolume + 
                  " churned members) = " + churnRate + 
                  " (with staff reduction: " + (churnReduction * 100) + "%)");
      
      return churnRate;
    };

    this.monthlyLeadVolume = function () {
      // Apply lead multiplier from events
      var adjustedLeadVolume = monthlyLeadVolume * leadMultiplier;
      
      // Apply lead boost from staff
      var staffBenefits = getStaffBenefits();
      var leadBoost = staffBenefits.leadBoost || 0;
      
      // Apply the lead boost (add the percentage increase)
      adjustedLeadVolume = Math.round(adjustedLeadVolume * (1 + leadBoost));
      
      return adjustedLeadVolume;
    };

    this.monthlySalesVolume = function () {
      // Apply sales boost from staff
      var staffBenefits = getStaffBenefits();
      var salesBoost = staffBenefits.salesBoost || 0;
      
      // Apply the sales boost (add the percentage increase)
      var adjustedSalesVolume = Math.round(monthlySalesVolume * (1 + salesBoost));
      
      return adjustedSalesVolume;
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
      console.log("MIS.monthlyStaffCost() called");
      
      if (cache.monthlyOfficeManagerCost === null) {
        console.log("Recalculating monthlyOfficeManagerCost");
        
        // First check if StaffStore exists and use it for staff costs
        if (typeof StaffStore !== 'undefined' && typeof StaffStore.getMonthlyStaffCost === 'function') {
          var staffCost = StaffStore.getMonthlyStaffCost();
          console.log("Got staff cost from StaffStore:", staffCost);
          cache.monthlyOfficeManagerCost = staffCost;
        }
        // Legacy fallback for compatibility
        else if (ProjectStore.isProjectCompleted("Hiring Plan")) {
          console.log("Using legacy staff cost calculation");
          cache.monthlyOfficeManagerCost = ProjectStore.isProjectCompleted("Hire Office Manager") ? 4167 : 0; // £50,000 per year = £4,167 per month
          
          // Add cost for Sales Manager if hired
          if (ProjectStore.isProjectCompleted("Hire Sales Manager")) {
            cache.monthlyOfficeManagerCost += 5000; // £60,000 per year = £5,000 per month
          }
          
          // Add cost for Marketing Manager if hired
          if (ProjectStore.isProjectCompleted("Hire Marketing Manager")) {
            cache.monthlyOfficeManagerCost += 5000; // £60,000 per year = £5,000 per month
          }
          
          console.log("Legacy staff cost calculated:", cache.monthlyOfficeManagerCost);
        } else {
          console.log("No Hiring Plan completed, setting staff cost to 0");
          cache.monthlyOfficeManagerCost = 0; // No managers without Hiring Plan
        }
      }
      
      if (cache.monthlyCommunityEventsCost === null) {
        console.log("Recalculating monthlyCommunityEventsCost");
        
        if (ProjectStore.isProjectCompleted("Run Community Events")) {
          // Calculate cost based on number of members and per-member budget
          var memberCount = this.memberUserCount();
          
          // Apply event budget discount from staff
          var staffBenefits = getStaffBenefits();
          var eventBudgetDiscount = staffBenefits.eventBudgetDiscount || 0;
          
          // Calculate total monthly cost based on per-member amount with discount
          var baseCost = memberCount * communityEventsPerMember;
          cache.monthlyCommunityEventsCost = Math.round(baseCost * (1 - Math.min(eventBudgetDiscount, 0.5)));
          console.log("Community events cost calculated:", cache.monthlyCommunityEventsCost);
        } else {
          cache.monthlyCommunityEventsCost = 0;
        }
      }
      
      // Base staff cost from space area and rates
      var baseStaffCost = parseInt(this.staffRate() * totalArea / 12);
      console.log("Base staff cost (from space area):", baseStaffCost);
      
      // IMPORTANT: Do not call StaffStore.getMonthlyStaffCost() again, use the cached value
      // This avoids duplicate calculations and potential logging issues
      var staffStoreCost = 0;
      
      // If Staff Store was used and returned a value, don't use legacy costs
      if (cache.monthlyOfficeManagerCost > 0 && typeof StaffStore !== 'undefined') {
        console.log("Using StaffStore cost directly:", cache.monthlyOfficeManagerCost);
        // Use the value already in the cache for total staff cost
        staffStoreCost = 0; // Don't double count
      } else {
        console.log("Using legacy staff cost system");
        staffStoreCost = 0;
      }
      
      // Total the costs
      var total = baseStaffCost + 
                 cache.monthlyOfficeManagerCost + 
                 cache.monthlyCommunityEventsCost +
                 staffStoreCost;
      
      console.log("Total monthly staff cost calculation:", 
                 "Base:", baseStaffCost,
                 "Office Manager:", cache.monthlyOfficeManagerCost,
                 "Events:", cache.monthlyCommunityEventsCost,
                 "Extra:", staffStoreCost,
                 "Total:", total);
      
      return total;
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
    };
    
    // Record financial data for historical tracking
    this.recordFinancialData = function() {
      var currentDate = new Date(AppStore.date().getTime());
      var formattedDate = currentDate.getDate() + '/' + (currentDate.getMonth() + 1);
      
      // Record revenue data
      financialHistory.revenue.push({
        date: currentDate,
        label: formattedDate,
        value: this.monthlyRevenue()
      });
      
      // Record bank balance
      financialHistory.bankBalance.push({
        date: currentDate,
        label: formattedDate,
        value: AppStore.bankAccount().balance()
      });
      
      // Record forecast cash low
      financialHistory.cashLow.push({
        date: currentDate,
        label: formattedDate,
        value: this.foreCastCashLow()
      });
      
      // Record monthly profit (revenue - all costs)
      var revenue = this.monthlyRevenue();
      var costs = this.monthlyOverheads() + (this.quarterlyRentBill() / 3);
      var profit = revenue - costs;
      
      financialHistory.profit.push({
        date: currentDate,
        label: formattedDate,
        value: profit
      });
      
      // Keep only the last N items
      if (financialHistory.revenue.length > financialHistory.maxItems) {
        financialHistory.revenue.shift();
      }
      
      if (financialHistory.bankBalance.length > financialHistory.maxItems) {
        financialHistory.bankBalance.shift();
      }
      
      if (financialHistory.cashLow.length > financialHistory.maxItems) {
        financialHistory.cashLow.shift();
      }
      
      if (financialHistory.profit.length > financialHistory.maxItems) {
        financialHistory.profit.shift();
      }
    };
    
    // Get financial history for charting
    this.getFinancialHistory = function(type) {
      if (type === 'revenue') {
        return financialHistory.revenue;
      } else if (type === 'bankBalance') {
        return financialHistory.bankBalance;
      } else if (type === 'cashLow') {
        return financialHistory.cashLow;
      } else if (type === 'profit') {
        return financialHistory.profit;
      }
    };
    
    // Event-related methods
    this.increaseLeadMultiplier = function(multiplier, durationDays) {
      leadMultiplier = multiplier;
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      leadMultiplierEndDate = endDate;
    };
    
    this.decreaseLeadMultiplier = function(multiplier, durationDays) {
      leadMultiplier = multiplier; // Should be < 1
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      leadMultiplierEndDate = endDate;
    };
    
    this.getLeadMultiplier = function() {
      return leadMultiplier;
    };
    
    this.increaseChurnMultiplier = function(multiplier, durationDays) {
      churnMultiplier = multiplier; // > 1 means more churn
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      churnMultiplierEndDate = endDate;
    };
    
    this.decreaseChurnMultiplier = function(multiplier, durationDays) {
      churnMultiplier = multiplier; // < 1 means less churn
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      churnMultiplierEndDate = endDate;
    };
    
    this.getChurnMultiplier = function() {
      return churnMultiplier;
    };
    
    this.boostNps = function(amount, durationDays) {
      npsBoost = amount;
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      npsBoostEndDate = endDate;
      
      // Apply boost immediately
      this.calculateNps();
    };
    
    this.decreaseNps = function(amount, durationDays) {
      npsBoost = -amount; // Negative for decrease
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      npsBoostEndDate = endDate;
      
      // Apply decrease immediately
      this.calculateNps();
    };
    
    this.increaseOverheadMultiplier = function(multiplier, durationDays) {
      overheadMultiplier = multiplier; // > 1 means higher costs
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      overheadMultiplierEndDate = endDate;
    };
    
    this.decreaseOverheadMultiplier = function(multiplier, durationDays) {
      overheadMultiplier = multiplier; // < 1 means lower costs
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      overheadMultiplierEndDate = endDate;
    };
    
    this.getOverheadMultiplier = function() {
      return overheadMultiplier;
    };
    
    this.addTemporaryMembers = function(count, durationDays) {
      temporaryMembers = count;
      var endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);
      temporaryMembersEndDate = endDate;
    };
    
    // Calculate NPS score based on price, density and events budget
    this.calculateNps = function() {
      // Base NPS on price, density, and events budget
      var pricing = AppStore.workstationPrice();
      var density = AppStore.density();
      
      // Start with a base score
      var baseScore = 50;
      
      // Adjust for pricing (lower is better)
      var priceFactor = 0;
      if (pricing <= 600) {
        priceFactor = 20; // Great price
      } else if (pricing <= 800) {
        priceFactor = 10; // Good price
      } else if (pricing <= 1000) {
        priceFactor = 0; // Neutral
      } else if (pricing <= 1200) {
        priceFactor = -10; // Expensive
      } else {
        priceFactor = -20; // Very expensive
      }
      
      // Adjust for density (lower is better)
      var densityFactor = 0;
      if (density <= 10) {
        densityFactor = 15; // Spacious
      } else if (density <= 20) {
        densityFactor = 5; // Good space
      } else if (density <= 30) {
        densityFactor = 0; // Neutral
      } else if (density <= 40) {
        densityFactor = -10; // Cramped
      } else {
        densityFactor = -20; // Very cramped
      }
      
      // Adjust for community events (higher is better)
      var eventsFactor = 0;
      if (communityEventsPerMember >= 40) {
        eventsFactor = 15; // Excellent events
      } else if (communityEventsPerMember >= 30) {
        eventsFactor = 10; // Great events
      } else if (communityEventsPerMember >= 20) {
        eventsFactor = 5; // Good events
      } else if (communityEventsPerMember >= 10) {
        eventsFactor = 0; // Some events
      } else {
        eventsFactor = -5; // Few events
      }
      
      // Calculate the total score
      var totalScore = baseScore + priceFactor + densityFactor + eventsFactor;
      
      // Apply the event boost
      totalScore += npsBoost;
      
      // Apply staff NPS boost
      var staffBenefits = getStaffBenefits();
      totalScore += staffBenefits.npsBoost || 0;
      
      // Clamp between 0 and 100
      totalScore = Math.max(0, Math.min(100, totalScore));
      
      // Update the NPS score
      npsScore = totalScore;
      
      // Generate feedback based on the biggest issue
      var feedback = "";
      var lowestFactor = Math.min(priceFactor, densityFactor, eventsFactor);
      
      if (totalScore >= 70) {
        if (priceFactor >= 10 && densityFactor >= 10) {
          feedback = "Members love the space and value!";
        } else if (communityEventsPerMember >= 30) {
          feedback = "The community events are highly appreciated!";
        } else {
          feedback = "Members are very satisfied with their experience.";
        }
      } else if (totalScore >= 50) {
        if (lowestFactor === priceFactor && priceFactor < 0) {
          feedback = "Some members feel the price is a bit high.";
        } else if (lowestFactor === densityFactor && densityFactor < 0) {
          feedback = "Some members would prefer more space.";
        } else if (lowestFactor === eventsFactor && eventsFactor <= 0) {
          feedback = "Members would appreciate more community events.";
        } else {
          feedback = "Members are generally satisfied with the space.";
        }
      } else if (totalScore >= 30) {
        if (lowestFactor === priceFactor && priceFactor < -10) {
          feedback = "Many members complain about the high price.";
        } else if (lowestFactor === densityFactor && densityFactor < -10) {
          feedback = "The space feels too crowded for many members.";
        } else if (lowestFactor === eventsFactor && eventsFactor < 0) {
          feedback = "There's not enough community engagement.";
        } else {
          feedback = "Members have mixed feelings about their experience.";
        }
      } else {
        if (priceFactor < -15 && densityFactor < -15) {
          feedback = "Members find the space overpriced and overcrowded!";
        } else if (priceFactor < -15) {
          feedback = "The pricing is driving members away!";
        } else if (densityFactor < -15) {
          feedback = "Members hate how cramped the space is!";
        } else {
          feedback = "Members are very dissatisfied with their experience.";
        }
      }
      
      npsFeedback = feedback;
      
      // Request UI update
      if (typeof needsUiUpdate !== 'undefined') {
        needsUiUpdate = true;
      }
      
      return totalScore;
    };
    
    this.getNpsScore = function() {
      return npsScore;
    };
    
    this.getNpsFeedback = function() {
      return npsFeedback;
    };
    
    // Check for expired multipliers - call this in the recalculateMonthlyChurn method
    this.checkExpiredMultipliers = function() {
      var now = new Date();
      
      // Lead multiplier
      if (leadMultiplierEndDate && now >= leadMultiplierEndDate) {
        leadMultiplier = 1;
        leadMultiplierEndDate = null;
      }
      
      // Churn multiplier
      if (churnMultiplierEndDate && now >= churnMultiplierEndDate) {
        churnMultiplier = 1;
        churnMultiplierEndDate = null;
      }
      
      // NPS boost
      if (npsBoostEndDate && now >= npsBoostEndDate) {
        npsBoost = 0;
        npsBoostEndDate = null;
        this.calculateNps(); // Recalculate NPS now that boost is gone
      }
      
      // Overhead multiplier
      if (overheadMultiplierEndDate && now >= overheadMultiplierEndDate) {
        overheadMultiplier = 1;
        overheadMultiplierEndDate = null;
      }
      
      // Temporary members
      if (temporaryMembersEndDate && now >= temporaryMembersEndDate) {
        temporaryMembers = 0;
        temporaryMembersEndDate = null;
      }
    };
     
    // Original memberUserCount function remains unchanged
    // We'll get member count from the spaces instead of trying to use AppStore.memberCompanies
    var originalMemberUserCount = this.memberUserCount;
    
    // Override only if we have temporary members
    this.memberUserCount = function() {
      if (temporaryMembers > 0) {
        // Get the actual count using the existing spaces method
        var base = 0;
        var spaces = AppStore.spaces();
        for (var i = 0; i < spaces.length; i++) {
          base += spaces[i].occupiedWorkstations();
        }
        return base + temporaryMembers;
      } else {
        // Use the original method if no temporary members
        return originalMemberUserCount.call(this);
      }
    };
    
    // Community events budget methods
    this.getCommunityEventsPerMember = function() {
      return communityEventsPerMember;
    };
    
    this.setCommunityEventsPerMember = function(amount) {
      // Ensure amount is a positive number
      amount = Math.max(0, amount);
      if (communityEventsPerMember !== amount) {
        communityEventsPerMember = amount;
        resetCache();
        return true;
      }
      return false;
    };
    
    this.incrementCommunityEventsPerMember = function() {
      // Increment by £1 per member
      communityEventsPerMember += 1;
      resetCache();
      return true;
    };
    
    this.decrementCommunityEventsPerMember = function() {
      // Minimum amount is £0 per member
      if (communityEventsPerMember > 0) {
        communityEventsPerMember -= 1;
        resetCache();
        return true;
      }
      return false;
    };
    
    // Calculate NPS based on various factors
    this.calculateNps = function() {
      console.log("Calculating NPS...");
      
      // Always calculate NPS even if not visible yet, to ensure it's up to date when it becomes visible
      // This ensures the gauge isn't stuck at the starting value
      if (typeof ProgressionStore !== 'undefined' && !ProgressionStore.isFeatureVisible('npsGauge')) {
        console.log("NPS gauge not visible yet, but still calculating current score");
      }
      
      // Base NPS score - neutral starting point
      let baseNps = 50;
      let factors = [];
      let totalImpact = 0;
      
      console.log("Starting NPS calculation with base score: " + baseNps);
      
      // Make NPS more responsive to changes
      // Instead of using churn as an input to NPS, we'll make NPS more sensitive
      // to the factors that affect member satisfaction
      
      // Density impact (too dense = unhappy members, too spacious = comfortable)
      const density = AppStore.density();
      console.log("Current density: " + density);
      
      if (density < 50) {
        // Stronger negative impact for cramped workspaces
        const densityImpact = -(50 - density) * 2.5;  // Increased impact
        totalImpact += densityImpact;
        factors.push({issue: "Workspaces too crowded", impact: densityImpact});
        console.log("Density too low: " + densityImpact + " impact");
      } else if (density > 60) {
        // More significant positive impact for spacious offices
        const densityImpact = Math.min((density - 60) * 1.5, 25);  // Increased impact
        totalImpact += densityImpact;
        factors.push({issue: "Spacious work environment", impact: densityImpact});
        console.log("Density good (spacious): " + densityImpact + " impact");
      } else {
        // Neutral zone - small positive impact
        const densityImpact = 8;  // Slightly higher positive impact for ideal range
        totalImpact += densityImpact;
        factors.push({issue: "Comfortable workspace density", impact: densityImpact});
        console.log("Density neutral: " + densityImpact + " impact");
      }
      
      // Price impact (too expensive = unhappy members)
      const price = AppStore.workstationPrice();
      const defaultPrice = AppStore.defaultWorkstationPrice();
      console.log("Price: £" + price + " (default: £" + defaultPrice + ")");
      
      const priceRatio = price / defaultPrice;
      
      if (priceRatio > 1.5) {
        // Severe negative impact for very high prices
        const priceImpact = -Math.min(((price - (defaultPrice * 1.5)) / 50) * 15, 40);  // Increased impact
        totalImpact += priceImpact;
        factors.push({issue: "Price is much too high", impact: priceImpact});
        console.log("Price very high: " + priceImpact + " impact");
      } else if (priceRatio > 1.2) {
        // Moderate negative impact for high prices
        const priceImpact = -Math.min(((price - (defaultPrice * 1.2)) / 50) * 10, 30);  // Increased impact
        totalImpact += priceImpact;
        factors.push({issue: "Price is too high", impact: priceImpact});
        console.log("Price high: " + priceImpact + " impact");
      } else if (priceRatio < 0.8) {
        // Small positive impact for lower prices
        const priceImpact = Math.min((defaultPrice - price) / 15, 20);  // Increased impact
        totalImpact += priceImpact;
        factors.push({issue: "Good value for money", impact: priceImpact});
        console.log("Price low (good value): " + priceImpact + " impact");
      } else {
        // Neutral price range - small positive impact
        const priceImpact = 5;
        totalImpact += priceImpact;
        factors.push({issue: "Fair pricing", impact: priceImpact});
        console.log("Price neutral: " + priceImpact + " impact");
      }
      
      // Occupancy impact (too low = no community, too high = too noisy/crowded)
      const currentOccupancy = this.occupancy();
      console.log("Current occupancy: " + (currentOccupancy * 100).toFixed(1) + "%");
      
      if (currentOccupancy < 0.3) {
        const lowOccupancyImpact = -(0.3 - currentOccupancy) * 150;  // Increased impact
        totalImpact += lowOccupancyImpact;
        factors.push({issue: "Community feels empty", impact: lowOccupancyImpact});
        console.log("Low occupancy: " + lowOccupancyImpact + " impact");
      } else if (currentOccupancy > 0.9) {
        const highOccupancyImpact = -(currentOccupancy - 0.9) * 300;  // Increased impact
        totalImpact += highOccupancyImpact;
        factors.push({issue: "Space feels overcrowded", impact: highOccupancyImpact});
        console.log("High occupancy: " + highOccupancyImpact + " impact");
      } else if (currentOccupancy > 0.7) {
        // Good occupancy - vibrant community
        const goodOccupancyImpact = 15;  // Increased impact
        totalImpact += goodOccupancyImpact;
        factors.push({issue: "Vibrant community atmosphere", impact: goodOccupancyImpact});
        console.log("Good occupancy: " + goodOccupancyImpact + " impact");
      } else if (currentOccupancy > 0.5) {
        // Moderate occupancy - decent community
        const moderateOccupancyImpact = 8;
        totalImpact += moderateOccupancyImpact;
        factors.push({issue: "Growing community", impact: moderateOccupancyImpact});
        console.log("Moderate occupancy: " + moderateOccupancyImpact + " impact");
      } else {
        // Low-moderate occupancy - emerging community
        const emergingOccupancyImpact = 3;
        totalImpact += emergingOccupancyImpact;
        factors.push({issue: "Emerging community", impact: emergingOccupancyImpact});
        console.log("Emerging occupancy: " + emergingOccupancyImpact + " impact");
      }
      
      // Office manager impact (if hired)
      if (typeof ProjectStore !== 'undefined' && ProjectStore.isProjectCompleted && ProjectStore.isProjectCompleted("Hire Office Manager")) {
        const managerImpact = 20;  // Increased impact
        totalImpact += managerImpact;
        factors.push({issue: "Office Manager improves experience", impact: managerImpact});
        console.log("Office Manager: " + managerImpact + " impact");
      }
      
      // Amenities impact (if improved)
      if (typeof ProjectStore !== 'undefined' && ProjectStore.isProjectCompleted && ProjectStore.isProjectCompleted("Improve Amenities")) {
        const amenitiesImpact = 20;  // Increased impact
        totalImpact += amenitiesImpact;
        factors.push({issue: "Members love the improved amenities", impact: amenitiesImpact});
        console.log("Improved Amenities: " + amenitiesImpact + " impact");
      }
      
      // Community events impact - SIGNIFICANTLY INCREASED IMPORTANCE
      if (typeof ProjectStore !== 'undefined' && ProjectStore.isProjectCompleted && ProjectStore.isProjectCompleted("Run Community Events")) {
        console.log("Community Events active with budget: £" + communityEventsPerMember + " per member");
        
        // Calculate impact based on per-member budget
        let memberCount = this.memberUserCount();
        
        // Impact is based on the per-member budget amount
        // £0 = EXTREME negative impact (should dominate feedback)
        let budgetImpact = 0;
        let feedbackMessage = "";
        
        if (communityEventsPerMember === 0) {
          budgetImpact = -40; // EXTREME penalty for not investing in community at all
          feedbackMessage = "Members want community events";
          console.log("⚠️ No events budget: " + budgetImpact + " impact (CRITICAL negative factor)");
        } else if (communityEventsPerMember <= 1) {
          // £1 is just starting to address the issue but still not enough
          budgetImpact = -25 + (communityEventsPerMember * 20); // -25 at £0.5, -5 at £1
          feedbackMessage = communityEventsPerMember < 1 ? "Events budget too low" : "Need more community events";
          console.log("⚠️ Insufficient events budget (£" + communityEventsPerMember + "): " + budgetImpact + " impact");
        } else if (communityEventsPerMember < 2) {
          // Between £1-2 starts to show positive impact
          budgetImpact = -5 + ((communityEventsPerMember - 1) * 15); // -5 at £1, +10 at £2
          feedbackMessage = "Basic community events program";
          console.log("Low events budget: " + budgetImpact + " impact");
        } else if (communityEventsPerMember < 4) {
          budgetImpact = 10 + ((communityEventsPerMember - 2) * 10); // +10 at £2, +30 at £4
          feedbackMessage = "Regular community events boost satisfaction";
          console.log("Medium events budget: " + budgetImpact + " impact");
        } else {
          budgetImpact = 30 + Math.min((communityEventsPerMember - 4) * 5, 15); // +30 at £4, +45 max
          feedbackMessage = "Members love the exceptional events program";
          console.log("High events budget: " + budgetImpact + " impact");
        }
        
        // Scale impact by community size, but NEVER scale the negative impact
        // when budget is 0 or very low - this should always be a major issue
        let scaleFactor = 1.0;
        if (communityEventsPerMember >= 1) {
          // Only scale positive impacts or modest negative impacts
          scaleFactor = Math.min(1, memberCount / 80);
        } else if (budgetImpact < -25) {
          // For severe negative impacts (no budget or very low budget), keep at least 90% of the impact
          scaleFactor = Math.max(0.9, Math.min(1, memberCount / 80));
        }
        
        let totalEventsImpact = Math.round(budgetImpact * scaleFactor);
        
        // Add to total impact
        totalImpact += totalEventsImpact;
        
        // If events budget is 0, artificially increase the absolute impact value
        // for sorting purposes to GUARANTEE it shows up as top feedback
        let sortImpact = totalEventsImpact;
        if (communityEventsPerMember === 0) {
          // For sorting purposes only - this won't affect the actual NPS calculation
          sortImpact = -100; // Ensure it sorts as the most important factor
          console.log("⚠️ Forcing zero events budget to be top feedback factor");
        }
        
        factors.push({issue: feedbackMessage, impact: totalEventsImpact, sortImpact: sortImpact});
        
        console.log("Final events impact (after scaling by " + scaleFactor.toFixed(2) + "): " + totalEventsImpact);
      }
      
      // Calculate final NPS
      let previousNps = npsScore;
      npsScore = Math.min(Math.max(Math.round(baseNps + totalImpact), 0), 100);
      
      console.log("Total impact: " + totalImpact);
      console.log("NPS changed from " + previousNps + " to " + npsScore);
      
      // Set feedback to the most impactful factor (either positive or negative)
      if (factors.length > 0) {
        // Sort factors by sortImpact value if available, otherwise by absolute impact
        factors.sort((a, b) => {
          const aValue = a.sortImpact !== undefined ? Math.abs(a.sortImpact) : Math.abs(a.impact);
          const bValue = b.sortImpact !== undefined ? Math.abs(b.sortImpact) : Math.abs(b.impact);
          return bValue - aValue;
        });
        
        // Get the top factor for feedback
        npsFeedback = factors[0].issue;
        console.log("Top feedback factor: " + npsFeedback + " (impact: " + factors[0].impact + 
                    (factors[0].sortImpact !== undefined ? ", sort priority: " + factors[0].sortImpact : "") + ")");
        
        // Also log secondary factors for debugging
        if (factors.length > 1) {
          console.log("Secondary factors:");
          for (let i = 1; i < Math.min(factors.length, 3); i++) {
            console.log(" - " + factors[i].issue + " (impact: " + factors[i].impact + 
                      (factors[i].sortImpact !== undefined ? ", sort priority: " + factors[i].sortImpact : "") + ")");
          }
        }
      } else {
        npsFeedback = "Members are generally satisfied";
      }
      
      return npsScore;
    };
  };
})();
