var LeadGenerator = {
  call: function () {
    let marketingLevel = AppStore.marketingLevel();
    let damping = 20;
    let power = (1 + marketingLevel) / damping;
    let pricingFactor = 275 / AppStore.workstationPrice();
    let minLeads = pricingFactor * 2 ** (marketingLevel * 0.5);
    let maxLeads = pricingFactor * 2 ** (marketingLevel * 0.5 + power);
    let numberOfLeads = Math.floor(Math.random() * (maxLeads - minLeads) + minLeads);

    let leads = [];

    for (var i = 0; i < numberOfLeads; i++) {
      let size = Math.round(Math.random() * 9) + 1;
      let lead = new Lead({size: size});
      leads.push(lead);
      AppStore.managementInformationSystem().addLead(lead); // TODO: Flux pattern
    }

    return leads;
  }
};
