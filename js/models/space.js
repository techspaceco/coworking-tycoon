var Space;

(function () {
  Space = function (options) {
    var lease = options.lease;
    var density = options.density;
    var area = options.lease.area();
    
    // Aggregate data structure instead of individual member companies
    var memberStats = {
      totalCount: 0,           // Total number of member companies
      totalSize: 0,            // Total number of people (workstations occupied)
      companySizeDistribution: {}, // Map of company size to count, e.g. {1: 5, 2: 3, 5: 2}
      lastChurnDate: null,     // Last date churn was calculated
      churnProbability: 0.02,  // Base probability a company will churn per day - increased from 0.01
      recentChurn: []          // Limited list of recent companies that left (for churn stats)
    };

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

    // For compatibility with existing code
    this.memberCompanies = function () {
      // Return a proxy array that mimics the behavior but doesn't contain real objects
      if (memberStats.totalCount === 0) {
        return [];
      }
      
      // Create proxy objects that fake enough behavior to work with existing code
      var proxies = [];
      for (var sizeKey in memberStats.companySizeDistribution) {
        var count = memberStats.companySizeDistribution[sizeKey];
        var actualSize = parseInt(sizeKey); // Convert string key to number
        
        for (var i = 0; i < count; i++) {
          // Use IIFE to capture the correct size value in closure
          (function(capturedSize) {
            proxies.push({
              size: function() { return capturedSize; },
              wantsToLeave: function() { 
                // Apply churn probability based on price and density factors
                var priceFactor = AppStore.workstationPrice() / AppStore.defaultWorkstationPrice();
                var densityFactor = AppStore.density() / AppStore.defaultDensity();
                var churnMultiplier = (priceFactor * 1.5) * (densityFactor * 0.8);
                return Math.random() < (memberStats.churnProbability * churnMultiplier);
              },
              setOffboardedOn: function(date) { 
                // Used by offboard method
                return date; 
              },
              // Track company size for churn calculations
              _size: capturedSize
            });
          })(actualSize);
        }
      }
      
      return proxies;
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
      return this.occupiedWorkstations() / this.totalWorkstations();
    };

    this.occupiedWorkstations = function () {
      return memberStats.totalSize;
    };

    // Simplified offboard that works with both real and proxy company objects
    this.offboard = function (company) {
      var companySize = company._size || company.size();
      
      // Update aggregate counts
      if (memberStats.companySizeDistribution[companySize]) {
        memberStats.companySizeDistribution[companySize]--;
        if (memberStats.companySizeDistribution[companySize] <= 0) {
          delete memberStats.companySizeDistribution[companySize];
        }
      }
      
      memberStats.totalCount--;
      memberStats.totalSize -= companySize;
      
      // Create a minimal churn record for stats
      var churnRecord = {
        size: function() { return companySize; },
        offboardedOn: function() { return AppStore.date(); }
      };
      
      // Keep only recent churn for memory efficiency
      memberStats.recentChurn.push(churnRecord);
      if (memberStats.recentChurn.length > 100) {
        memberStats.recentChurn.shift(); // Remove oldest
      }
      
      // Notify MIS
      var mis = AppStore.managementInformationSystem();
      mis.clearOccupancyCache();
      mis.addToChurn(churnRecord);
      
      return true;
    };

    // Simplified onboard that stores aggregated data
    this.onboard = function (company) {
      var companySize = company.size();
      
      // Debug information to track onboarding
      console.log("Onboarding company of size " + companySize);
      
      // Update aggregate counts
      memberStats.totalCount++;
      memberStats.totalSize += companySize;
      
      if (!memberStats.companySizeDistribution[companySize]) {
        memberStats.companySizeDistribution[companySize] = 0;
      }
      memberStats.companySizeDistribution[companySize]++;
      
      // Force UI update
      needsUiUpdate = true;
      
      return true;
    };

    this.quarterlyRent = function () {
      return this.lease().quarterlyRent();
    };

    this.totalWorkstations = function () {
      return Math.floor(area / density);
    };
    
    // Get churn data for the MIS
    this.getRecentChurn = function() {
      return memberStats.recentChurn;
    };
    
    // Simple direct member removal for churn
    this.forceRemoveMembers = function(count) {
      if (count <= 0 || memberStats.totalSize === 0) {
        return 0;
      }
      
      console.log("Space force removing " + count + " members");
      
      var removed = 0;
      
      // Remove members from each size bucket proportionally
      for (var size in memberStats.companySizeDistribution) {
        size = parseInt(size);
        var companies = memberStats.companySizeDistribution[size];
        
        if (companies <= 0) {
          continue;
        }
        
        // How many companies of this size should we remove?
        var toRemove = Math.min(companies, Math.ceil(count / size));
        
        if (toRemove <= 0) {
          continue;
        }
        
        // Update counts
        memberStats.companySizeDistribution[size] -= toRemove;
        memberStats.totalCount -= toRemove;
        var peopleRemoved = toRemove * size;
        memberStats.totalSize -= peopleRemoved;
        removed += peopleRemoved;
        
        console.log("Removed " + toRemove + " companies of size " + size + 
                    " (" + peopleRemoved + " people)");
        
        // If we've removed enough, stop
        if (removed >= count) {
          break;
        }
      }
      
      // Clean up empty size buckets
      for (var size in memberStats.companySizeDistribution) {
        if (memberStats.companySizeDistribution[size] <= 0) {
          delete memberStats.companySizeDistribution[size];
        }
      }
      
      return removed;
    };
    
    // Statistical churn method that doesn't require iterating through every company
    this.processStatisticalChurn = function() {
      var totalChurned = 0;
      var churned = [];
      
      // Skip if no members
      if (memberStats.totalCount === 0) {
        return churned;
      }
      
      console.log("Processing churn for space with " + memberStats.totalCount + " companies");
      
      // Apply churn probability based on price and density factors
      var priceFactor = AppStore.workstationPrice() / AppStore.defaultWorkstationPrice();
      var densityFactor = AppStore.density() / AppStore.defaultDensity();
      var churnMultiplier = (priceFactor * 1.5) * (densityFactor * 0.8);
      var effectiveChurnRate = memberStats.churnProbability * churnMultiplier;
      
      // Ensure some minimum churn (at least 0.3% per day = ~10% per month)
      var minChurnRate = 0.003; 
      effectiveChurnRate = Math.max(effectiveChurnRate, minChurnRate);
      
      console.log("Effective churn rate: " + effectiveChurnRate);
      
      // Process churn for each company size group
      for (var size in memberStats.companySizeDistribution) {
        var count = memberStats.companySizeDistribution[size];
        size = parseInt(size);
        
        // Calculate number of companies of this size that will churn
        // Ensure we don't churn out too many companies at once
        var maxChurnRate = 0.02; // Cap at 2% per day maximum (~45% per month)
        var safeChurnRate = Math.min(effectiveChurnRate, maxChurnRate);
        
        // Force at least one company to churn if we have more than 10 companies and random chance hits
        var churnCount = Math.floor(count * safeChurnRate);
        if (churnCount === 0 && count >= 10 && Math.random() < 0.1) {
          churnCount = 1;
        }
        
        // Create proxy churn objects using IIFE to properly capture size
        for (var i = 0; i < churnCount; i++) {
          (function(capturedSize) {
            var currentDate = new Date();
            currentDate.setTime(AppStore.date().getTime());
            
            var churnRecord = {
              size: function() { return capturedSize; },
              offboardedOn: function() { return currentDate; },
              _size: capturedSize
            };
            churned.push(churnRecord);
            totalChurned += churnRecord._size;
            
            console.log("Company of size " + capturedSize + " churned");
          })(size);
          
          // Update aggregate stats
          memberStats.totalCount--;
          memberStats.totalSize -= size;
          memberStats.companySizeDistribution[size]--;
          
          // Add to recent churn for reporting
          memberStats.recentChurn.push(churnRecord);
          if (memberStats.recentChurn.length > 100) {
            memberStats.recentChurn.shift();
          }
        }
        
        // Clean up if all companies of a size churned
        if (memberStats.companySizeDistribution[size] <= 0) {
          delete memberStats.companySizeDistribution[size];
        }
      }
      
      // Notify MIS if any churn happened
      if (churned.length > 0) {
        var mis = AppStore.managementInformationSystem();
        mis.clearOccupancyCache();
        
        // Add churn records to MIS
        for (var i = 0; i < churned.length; i++) {
          mis.addToChurn(churned[i]);
        }
      }
      
      memberStats.lastChurnDate = AppStore.date();
      return churned;
    };
  };
})();
