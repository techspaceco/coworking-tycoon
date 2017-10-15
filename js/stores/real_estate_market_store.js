var RealEstateMarketStore;

(function () {
  var startingPricePerSquareFoot = 17;
  var startingArea = 2300;

  var deals = [
    new LeaseDeal({
      lease: new Lease({
        pricePerSquareFoot: startingPricePerSquareFoot,
        area: startingArea,
        monthsDeposit: 6
      })
    })
  ];

  RealEstateMarketStore = {
    dealIds: function () {
      return deals.map(function (deal) {
        return deal.id();
      });
    },

    deals: function () {
      function generatePricePerSquareFoot() {
        var guide = AppStore.managementInformationSystem().maxPricePerSquareFoot();
        var min = startingPricePerSquareFoot;
        var max = Math.max(min, guide) * 1.5;

        return parseInt(Math.random() * (max - min) + min);
      }

      function generateArea() {
        var guide = AppStore.managementInformationSystem().maxSpaceArea() * 0.75;
        var min = Math.max(startingArea, guide);
        var max = Math.max(min, guide) * 3;

        return parseInt(Math.random() * (max - min) + min);
      }

      if (AppStore.spaces().length === 0) {
        // Pause until game starts
        return deals;
      }

      var newDeal;
      var minMonthsDeposit = 3;
      var maxMonthsDeposit = 12;

      if (!deals.length || deals.length < 3) {
        if (Math.random() > 0.99) {
          newDeal = new LeaseDeal({
            lease: new Lease({
              pricePerSquareFoot: generatePricePerSquareFoot(),
              area: generateArea(),
              // TODO: Covenant strength
              monthsDeposit: parseInt(
                (Math.floor(Math.random() * 4) + 1) * 3
              )
            })
          });

          deals.push(newDeal);
        }
      } else {
        deals.forEach(function (deal) {
          if (Math.random() > 0.99) {
            RealEstateMarketStore.takeDealOffMarket(deal);
          }
        });
      }

      return deals;
    },

    pricePerSquareFoot: function () {
      return pricePerSquareFoot;
    },

    takeDealOffMarket: function (deal) {
      deals.forEach(function (candidateDeal, index) {
        if (deal === candidateDeal) {
          deals.splice(index, 1);

          return;
        }
      })
    }
  };
})();
