var SalesGenerator = {
  // Cache member company objects to reduce garbage collection
  companyCache: [],
  maxCachedCompanies: 1000,
  
  getOrCreateMemberCompany: function(size, workstationPrice) {
    // Look for a company in the cache with the same size
    var cachedCompany = this.companyCache.find(function(company) {
      return company.size() === size && !company.isActive();
    });
    
    if (cachedCompany) {
      cachedCompany.activate(workstationPrice);
      return cachedCompany;
    }
    
    // Create a new company if none found in cache
    var company = new MemberCompany({
      size: size,
      workstationPrice: workstationPrice
    });
    
    // Add to cache if there's room
    if (this.companyCache.length < this.maxCachedCompanies) {
      this.companyCache.push(company);
    }
    
    return company;
  },
  
  // Process leads in batches by size for better performance
  call: function (leads) {
    if (leads.length === 0) {
      return;
    }
    
    var salesLevel = AppStore.salesLevel();
    var numberOfLeadsAbleToHandle = 2 ** salesLevel;
    var workstationPrice = AppStore.workstationPrice();
    var spaces = AppStore.spaces();
    var mis = AppStore.managementInformationSystem();
    var needsCacheReset = false;
    
    // Calculate sales parameters once
    var power = (1 + salesLevel) / 10; // damping = 10
    var pricingFactor = AppStore.defaultWorkstationPrice() / workstationPrice;
    var maxChanceOfClose = (
      pricingFactor *
      (2 ** power) /
      (
        ((2 ** power) + 1) *
        AppStore.densityFactor()
      )
    );
    
    // Group leads by size for more efficient processing
    var leadsBySize = {};
    var processedCount = 0;
    
    // Group up to the number we can handle
    for (var i = 0; i < leads.length && processedCount < numberOfLeadsAbleToHandle; i++) {
      var lead = leads[i];
      var size = lead.size();
      
      if (!leadsBySize[size]) {
        leadsBySize[size] = [];
      }
      
      leadsBySize[size].push(lead);
      processedCount++;
    }
    
    if (processedCount < leads.length) {
      Logger.log('Too many leads to handle!');
    }
    
    // For each size group, find spaces with availability and process all leads of that size at once
    for (var size in leadsBySize) {
      var sizeLeads = leadsBySize[size];
      size = parseInt(size);
      
      // Find spaces that can accommodate this size
      var availableSpaces = [];
      for (var j = 0; j < spaces.length; j++) {
        if (spaces[j].hasAvailabilityFor(size)) {
          availableSpaces.push(spaces[j]);
        }
      }
      
      // If no space available, skip these leads
      if (availableSpaces.length === 0) {
        continue;
      }
      
      // Process all leads of this size
      for (var k = 0; k < sizeLeads.length; k++) {
        var lead = sizeLeads[k];
        
        // Force some sales to happen early in the game
        // Debug: Increase close rate dramatically to ensure sales happen
        var forceSales = AppStore.managementInformationSystem().memberUserCount() < 10;
        var closed = forceSales || Math.random() < (maxChanceOfClose * 5);
        
        if (closed) {
          // Find best-fit space (one with smallest available capacity that fits)
          var bestSpace = availableSpaces[0];
          var bestAvailability = bestSpace.availableWorkstations();
          
          for (var l = 1; l < availableSpaces.length; l++) {
            var space = availableSpaces[l];
            var available = space.availableWorkstations();
            
            if (available >= size && available < bestAvailability) {
              bestSpace = space;
              bestAvailability = available;
            }
          }
          
          // Create or reuse a company object
          var company = this.getOrCreateMemberCompany(size, workstationPrice);
          
          // Onboard the company
          bestSpace.onboard(company);
          lead.setClosedOn(AppStore.date());
          mis.addSale(lead);
          needsCacheReset = true;
          
          // Update availability for the space
          if (bestAvailability - size < size) {
            // If remaining capacity is too small, remove from available spaces
            availableSpaces = availableSpaces.filter(function(s) {
              return s !== bestSpace;
            });
            
            if (availableSpaces.length === 0) {
              // No more spaces available for this size
              break;
            }
          }
        }
      }
    }
    
    // Only reset cache once if needed
    if (needsCacheReset) {
      mis.clearOccupancyCache();
    }
  }
};
