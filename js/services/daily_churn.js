var DailyChurn = {
    call: function () {
      var spaces = AppStore.spaces();
  
      if (spaces.length === 0) {
        return;
      }
      
      // Just do direct simple statistical churn
      var totalMembers = AppStore.managementInformationSystem().memberUserCount();
      if (totalMembers === 0) {
        return;
      }
      
      console.log("DAILY CHURN: Processing for " + totalMembers + " total members");
      
      // Target a realistic annual churn rate of 15-20%
      // This converts to around 0.0005 daily rate (5 members per 10,000 per day)
      var dailyChurnRate = 0.0005; 
      
      // Base adjustments for small/new businesses
      var mis = AppStore.managementInformationSystem();
      
      // Apply churn multiplier from events (if applicable)
      if (mis.getChurnMultiplier) {
        var eventMultiplier = mis.getChurnMultiplier();
        if (eventMultiplier !== 1) {
          console.log("Applying event churn multiplier: " + eventMultiplier);
          dailyChurnRate *= eventMultiplier;
        }
      }
      
      // Force NPS calculation to get latest values
      if (mis.calculateNps) {
        console.log("Recalculating NPS for churn calculation");
        mis.calculateNps();
      }
      
      // Primary factor: NPS score (if available)
      if (mis.getNpsScore) {
        var npsScore = mis.getNpsScore();
        console.log("NPS Score for churn calculation: " + npsScore);
        
        // Make NPS an even more dominant factor in churn rate
        // NPS of 0 = 5x the churn rate (very unhappy members leave quickly)
        // NPS of 50 = normal churn rate
        // NPS of 100 = one-fifth the churn rate (very happy members stay longer)
        var npsMultiplier = 5 - (npsScore / 25);  // 5.0 at NPS 0, 3.0 at NPS 25, 1.0 at NPS 50, 0.2 at NPS 100
        
        dailyChurnRate *= npsMultiplier;
        console.log("After NPS adjustment, churn rate: " + dailyChurnRate + " (multiplier: " + npsMultiplier + ")");
      } else {
        // If NPS not available, use legacy direct calculations
        console.log("No NPS available, using legacy direct calculations");
        
        // Adjust based on workstation price - higher price = higher churn
        var priceMultiplier = AppStore.workstationPrice() / AppStore.defaultWorkstationPrice();
        if (priceMultiplier > 1) {
          // Scale more gently - max 50% increase for double price
          dailyChurnRate *= (1 + (priceMultiplier - 1) * 0.5);
        }
        
        // Adjust based on density - higher density = higher churn 
        var densityMultiplier = AppStore.density() / AppStore.defaultDensity();
        if (densityMultiplier > 1) {
          // Scale more gently - max 30% increase for high density
          dailyChurnRate *= (1 + (densityMultiplier - 1) * 0.3);
        }
      }
      
      // Reduce churn if Office Manager is hired (by a moderate amount)
      // Keep this outside the NPS calculation as a direct business benefit
      if (typeof ProjectStore !== 'undefined' && ProjectStore.isProjectCompleted) {
        if (ProjectStore.isProjectCompleted("Hire Office Manager")) {
          // Only 10-20% reduction rather than a fixed 5%
          var reductionFactor = 0.15 + (Math.random() * 0.05);
          dailyChurnRate *= (1 - reductionFactor);
          console.log("Office Manager reduces churn by " + (reductionFactor * 100).toFixed(1) + "%");
        }
      }
      
      console.log("DAILY CHURN: Rate = " + dailyChurnRate);
      
      // Calculate how many people should leave today
      var peopleToChurn = Math.floor(totalMembers * dailyChurnRate);
      
      // Force at least some churn if we have enough members
      if (peopleToChurn === 0 && totalMembers >= 20 && Math.random() < 0.2) {
        peopleToChurn = 1;
      }
      
      if (peopleToChurn === 0) {
        return;
      }
      
      console.log("DAILY CHURN: " + peopleToChurn + " people will churn today");
      
      // Distribute churn across available spaces
      var remainingChurn = peopleToChurn;
      var mis = AppStore.managementInformationSystem();
      
      // Simple approach - just churn from each space with members
      for (var i = 0; i < spaces.length && remainingChurn > 0; i++) {
        var space = spaces[i];
        var occupiedWorkstations = space.occupiedWorkstations();
        
        if (occupiedWorkstations === 0) {
          continue;
        }
        
        // Calculate churn for this space
        var spaceChurn = Math.min(remainingChurn, Math.ceil(occupiedWorkstations * 0.5));
        
        if (spaceChurn > 0) {
          console.log("DAILY CHURN: Space " + i + " will churn " + spaceChurn + " people");
          
          // Force remove members directly
          space.forceRemoveMembers(spaceChurn);
          
          // Create a churn record
          var churnRecord = {
            size: function() { return spaceChurn; },
            offboardedOn: function() { return AppStore.date(); }
          };
          
          // Add to MIS
          mis.addToChurn(churnRecord);
          
          remainingChurn -= spaceChurn;
        }
      }
      
      mis.clearOccupancyCache();
      needsUiUpdate = true;
    }
  };
