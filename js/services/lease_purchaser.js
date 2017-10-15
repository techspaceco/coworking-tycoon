var LeasePurchaser = {
  call: function (leaseDeal) {
    var lease = leaseDeal.lease();
    AppStore.bankAccount().withdraw(lease.deposit());
    AppStore.addSpace(new Space({lease: lease, density: AppStore.density()}));
    RealEstateMarketStore.takeDealOffMarket(leaseDeal);

    // TODO: Flux pattern
    var rent = 0;
    var area = 0;
    var mis = AppStore.managementInformationSystem();

    AppStore.spaces().forEach(function (space) {
      rent += space.quarterlyRent();
      area += space.area();
    });

    mis.setQuarterlyRentBill(rent);
    mis.setTotalArea(area);

    if (lease.pricePerSquareFoot() > mis.maxPricePerSquareFoot()) {
      mis.setMaxPricePerSquareFoot(lease.pricePerSquareFoot());
    }

    if (lease.area() > mis.maxSpaceArea()) {
      mis.setMaxSpaceArea(lease.area());
    }
  }
};
