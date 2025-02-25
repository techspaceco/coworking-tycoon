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
