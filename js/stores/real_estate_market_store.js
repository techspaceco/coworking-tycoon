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
        // For the first space, always ensure we have the starting deal
        if (deals.length === 0) {
          console.log("Adding starting property to market");
          var startingDeal = new LeaseDeal({
            lease: new Lease({
              pricePerSquareFoot: startingPricePerSquareFoot,
              area: startingArea,
              monthsDeposit: 6
            })
          });
          deals.push(startingDeal);
        }
        return deals;
      }

      var newDeal;
      var minMonthsDeposit = 3;
      var maxMonthsDeposit = 12;

      // Make sure there are always some properties available (minimum 1, target 2-3)
      if (deals.length < 3) {
        // Higher chance of new properties appearing when few are available
        var newPropertyChance = deals.length === 0 ? 1.0 : (deals.length === 1 ? 0.5 : 0.3);
        
        if (Math.random() < newPropertyChance) {
          console.log("Generating new property on the market");
          
          newDeal = new LeaseDeal({
            lease: new Lease({
              pricePerSquareFoot: generatePricePerSquareFoot(),
              area: generateArea(),
              monthsDeposit: parseInt(
                (Math.floor(Math.random() * 4) + 1) * 3
              )
            })
          });

          deals.push(newDeal);
          console.log("Added new deal. Total deals: " + deals.length);
        }
      } else {
        // Remove deals occasionally if we have more than needed
        var dealsToRemove = [];
        deals.forEach(function (deal, index) {
          // Remove older deals with higher probability
          var ageBasedRemovalChance = 0.005 * (deals.length - index);
          if (Math.random() < ageBasedRemovalChance && deals.length > 2) {
            console.log("Taking property off the market");
            dealsToRemove.push(deal);
          }
        });
        
        // Remove deals outside the forEach to avoid array modification issues
        dealsToRemove.forEach(function(dealToRemove) {
          RealEstateMarketStore.takeDealOffMarket(dealToRemove);
        });
      }
      
      // Ensure we always have at least one property available
      if (deals.length === 0) {
        console.log("Generating emergency property on the market");
        newDeal = new LeaseDeal({
          lease: new Lease({
            pricePerSquareFoot: generatePricePerSquareFoot(),
            area: generateArea(),
            monthsDeposit: parseInt(
              (Math.floor(Math.random() * 4) + 1) * 3
            )
          })
        });
        deals.push(newDeal);
      }

      return deals;
    },

    pricePerSquareFoot: function () {
      return pricePerSquareFoot;
    },

    takeDealOffMarket: function (deal) {
      console.log("Taking deal off market - deals before: " + deals.length);
      
      // Filter approach rather than splice to avoid potential issues
      deals = deals.filter(function(candidateDeal) {
        return candidateDeal !== deal;
      });
      
      console.log("Deals after removing: " + deals.length);
      
      // Ensure we still have at least one property on the market
      if (deals.length === 0) {
        console.log("Adding new property to replace the one that was taken");
        var replacementDeal = new LeaseDeal({
          lease: new Lease({
            pricePerSquareFoot: parseInt(Math.random() * 10 + 15), // 15-25
            area: parseInt(Math.random() * 1000 + 2000), // 2000-3000
            monthsDeposit: parseInt(Math.random() * 6 + 3) // 3-9
          })
        });
        deals.push(replacementDeal);
      }
      
      // Force UI update
      if (typeof needsUiUpdate !== 'undefined') {
        needsUiUpdate = true;
      }
    }
  };
})();
