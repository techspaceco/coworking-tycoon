var LeadGenerator = {
  call: function () {
    var numberOfLeads = (0.5 * Math.round(Math.random() + 1)) ** AppStore.marketingLevel();
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
