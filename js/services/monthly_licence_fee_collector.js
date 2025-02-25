var MonthlyLicenceFeeCollector = {
  call: function () {
    var total = 0;
    var workstationPrice = AppStore.workstationPrice();
    var spaces = AppStore.spaces();

    // Optimized calculation using aggregate stats directly
    for (var i = 0; i < spaces.length; i++) {
      // Each workstation pays the workstation price
      total += spaces[i].occupiedWorkstations() * workstationPrice;
    }

    console.log("Collecting monthly license fees: " + total + " from " + 
                AppStore.managementInformationSystem().memberUserCount() + " members");

    AppStore.managementInformationSystem().setMonthlyLicenceFeeRevenue(total);
    AppStore.bankAccount().deposit(total);
    
    // Force UI update
    needsUiUpdate = true;
  }
};
