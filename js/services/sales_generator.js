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
        if (space.hasAvailabilityFor(size)) {
          let salesLevel = AppStore.salesLevel();
          let damping = 10;
          let power = (1 + salesLevel) / damping;
          let pricingFactor = AppStore.defaultWorkstationPrice() / AppStore.workstationPrice();
          let densityFactor = AppStore.defaultDensity() / AppStore.density();
          let minChanceOfClose = 0;

          let maxChanceOfClose = (
            pricingFactor *
            densityFactor *
            (2 ** power) /
            ((2 ** power) + 1)
          );

          let closed = (
            Math.random() * (maxChanceOfClose - minChanceOfClose) + minChanceOfClose > 0.5
          )

          if (closed) {
            space.onboard(new MemberCompany({
              size: size,
              workstationPrice: AppStore.workstationPrice()
            }));

            lead.setClosedOn(AppStore.date());

            let mis = AppStore.managementInformationSystem();
            mis.clearOccupancyCache(); // TODO: Flux pattern
            mis.addSale(lead);
          }

          return;
        }
      });
    });
  }
};
