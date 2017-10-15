var SalesGenerator = {
  call: function (leads) {
    var salesLevel = AppStore.salesLevel();
    var numberOfLeadsAbleToHandle = 2 ** salesLevel;

    leads.forEach(function (lead, index) {
      if (index > numberOfLeadsAbleToHandle) {
        Logger.log('Too many leads to handle!');

        return;
      }

      var size = lead.size();

      AppStore.spaces().forEach(function (space) {
        var closed, mis;

        if (space.hasAvailabilityFor(size)) {
          closed = ((Math.random() * (100 - salesLevel) + salesLevel) * 0.01 > 0.9);
          
          if (closed) {
            space.onboard(new MemberCompany({
              size: size,
              workstationPrice: AppStore.workstationPrice()
            }));

            lead.setClosedOn(AppStore.date());

            mis = AppStore.managementInformationSystem();
            mis.clearOccupancyCache(); // TODO: Flux pattern
            mis.addSale(lead);
          }

          return;
        }
      });
    });
  }
};
