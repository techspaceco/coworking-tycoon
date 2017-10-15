var MonthlyLicenceFeeCollector = {
  call: function () {
    var total = 0;

    AppStore.spaces().forEach(function (space) {
      space.memberCompanies().forEach(function (company) {
        total += company.licenceFee();
      });
    });

    AppStore.managementInformationSystem().setMonthlyLicenceFeeRevenue(total);
    AppStore.bankAccount().deposit(total);
  }
};
