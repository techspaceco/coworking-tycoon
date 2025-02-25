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
    let damping = 20;
    let power = (1 + marketingLevel) / damping;
    let pricingFactor = AppStore.defaultWorkstationPrice() / AppStore.workstationPrice();
    
    // Cap the number of leads based on sales level to prevent overwhelming
    // Sales level determines how many leads you can handle
    let salesLevel = AppStore.salesLevel();
    let maxLeadsHandleable = 2 ** salesLevel;
    
    // Calculate standard lead generation based on marketing
    let minLeads = Math.max(2, pricingFactor * 2 ** (marketingLevel * 0.3));
    let maxLeads = Math.max(4, pricingFactor * 2 ** (marketingLevel * 0.3 + power));
    
    // Cap to what you can handle (with a little buffer for variety)
    minLeads = Math.min(minLeads, maxLeadsHandleable * 0.5);
    maxLeads = Math.min(maxLeads, maxLeadsHandleable * 1.2);
    
    let numberOfLeads = Math.floor(Math.random() * (maxLeads - minLeads) + minLeads);
    
    console.log("Generating " + numberOfLeads + " leads");
    
    // Create a realistic size distribution that stays consistent
    // Companies of size 1-3 are most common (70%), 4-6 less common (25%), 7-10 rare (5%)
    var sizeDistribution = {
      1: 0.30,
      2: 0.25,
      3: 0.15,
      4: 0.10,
      5: 0.08,
      6: 0.07,
      7: 0.02,
      8: 0.01,
      9: 0.01,
      10: 0.01
    };
    
    // At the start of the game, bias toward smaller companies to ensure spaces fill
    if (AppStore.managementInformationSystem().memberUserCount() < 20) {
      sizeDistribution = {
        1: 0.40,
        2: 0.30,
        3: 0.20,
        4: 0.10
      };
    }
    
    return this.generateLeadBatch(numberOfLeads, sizeDistribution);
  }
};
