var LeadGenerator = {
  // Cache to avoid creating too many lead objects
  leadCache: [],
  maxCachedLeads: 1000,
  
  getOrCreateLead: function(size) {
    // Reuse a lead object from cache if possible
    var cachedLead = this.leadCache.find(function(lead) {
      return lead.size() === size && !lead.isActive();
    });
    
    if (cachedLead) {
      cachedLead.activate(AppStore.date());
      return cachedLead;
    }
    
    // Create a new lead if none found in cache
    var lead = new Lead({size: size});
    
    // Add to cache if there's room
    if (this.leadCache.length < this.maxCachedLeads) {
      this.leadCache.push(lead);
    }
    
    return lead;
  },
  
  generateLeadBatch: function(count, sizeDistribution) {
    var leads = [];
    var mis = AppStore.managementInformationSystem();
    
    // Generate leads based on size distribution
    for (var size in sizeDistribution) {
      size = parseInt(size);
      var countForSize = Math.round(count * sizeDistribution[size]);
      
      for (var i = 0; i < countForSize; i++) {
        var lead = this.getOrCreateLead(size);
        leads.push(lead);
        mis.addLead(lead);
      }
    }
    
    return leads;
  },
  
  call: function () {
    let marketingLevel = AppStore.marketingLevel();
    let damping = 22; // Moderate damping factor (was 25, now 22)
    let power = (1 + marketingLevel) / damping;
    let pricingFactor = AppStore.defaultWorkstationPrice() / AppStore.workstationPrice();
    
    // Cap the number of leads based on sales level to prevent overwhelming
    // Sales level determines how many leads you can handle
    let salesLevel = AppStore.salesLevel();
    let maxLeadsHandleable = 2 ** salesLevel;
    
    // Calculate standard lead generation based on marketing
    let minLeads = Math.max(2, pricingFactor * 2 ** (marketingLevel * 0.28)); // Increased exponent from 0.25 to 0.28
    let maxLeads = Math.max(4, pricingFactor * 2 ** (marketingLevel * 0.28 + power));
    
    // Apply lead multiplier from events if available
    let mis = AppStore.managementInformationSystem();
    if (mis.getLeadMultiplier) {
      let leadMultiplier = mis.getLeadMultiplier();
      if (leadMultiplier !== 1) {
        console.log("Applying event lead multiplier: " + leadMultiplier);
        minLeads *= leadMultiplier;
        maxLeads *= leadMultiplier;
      }
    }
    
    // Cap to what you can handle (with a moderate buffer)
    minLeads = Math.min(minLeads, maxLeadsHandleable * 0.6); // Increased from 0.4 to 0.6
    maxLeads = Math.min(maxLeads, maxLeadsHandleable * 1.2); // Increased from 1.0 to 1.2
    
    let numberOfLeads = Math.floor(Math.random() * (maxLeads - minLeads) + minLeads);
    
    console.log("Generating " + numberOfLeads + " leads");
    
    // Create a balanced company size distribution
    // Mix of small, medium and larger companies for interesting gameplay
    var sizeDistribution = {
      1: 0.28,  // Increased from 0.25 - more small companies for easy wins
      2: 0.24,  // Increased from 0.20 - more small companies for easy wins
      3: 0.18,  // Increased from 0.15
      4: 0.10,  // Decreased from 0.12
      5: 0.08,  // Decreased from 0.10
      6: 0.06,  // Decreased from 0.08
      7: 0.03,  // Decreased from 0.04
      8: 0.02,  // Decreased from 0.03
      9: 0.01,  // Decreased from 0.02
      10: 0.00  // Practically eliminated the hardest to place
    };
    
    // At the start of the game, bias more toward smaller companies
    if (AppStore.managementInformationSystem().memberUserCount() < 20) {
      sizeDistribution = {
        1: 0.40,  // Increased from 0.35 - make starting easier
        2: 0.35,  // Increased from 0.30
        3: 0.15,  // Decreased from 0.20
        4: 0.08,  // Decreased from 0.10
        5: 0.02   // Decreased from 0.05
      };
    }
    
    return this.generateLeadBatch(numberOfLeads, sizeDistribution);
  }
};
