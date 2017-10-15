var LeadGenerator = {
  call: function () {
    var marketingLevel = AppStore.marketingLevel();
    let damping = 10;
    let power = (1 + marketingLevel) / damping;
    var minLeads = 2 ** (marketingLevel * 0.5);
    var maxLeads = 2 ** (marketingLevel * 0.5 + power);
    var numberOfLeads = Math.floor(Math.random() * (maxLeads - minLeads) + minLeads);

    var leads = [];
    var i, lead, size;

    for (i = 0; i < numberOfLeads; i++) {
      size = Math.round(Math.random() * 9) + 1;
      lead = new Lead({size: size});
      leads.push(lead);
      AppStore.managementInformationSystem().addLead(lead); // TODO: Flux pattern
    }

    return leads;
  }
};
