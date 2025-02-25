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

      // Make sure there are always some properties available (1-3)
      if (!deals.length || deals.length < 3) {
        // Higher chance of new properties appearing when few are available
        var newPropertyChance = deals.length === 0 ? 0.5 : (deals.length === 1 ? 0.2 : 0.1);
        
        if (Math.random() < newPropertyChance) {
          console.log("Generating new property on the market");
          
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
        // Remove deals occasionally if we have more than needed
        deals.forEach(function (deal, index) {
          // Remove older deals with higher probability
          var ageBasedRemovalChance = 0.01 * (deals.length - index);
          if (Math.random() < ageBasedRemovalChance) {
            console.log("Taking property off the market");
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
