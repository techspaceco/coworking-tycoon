var InterfaceRepainter;

(function () {
  var mostRecentDealId;

  InterfaceRepainter= {
    call: function () {
      var mis = AppStore.managementInformationSystem();
      var dm = mis.decorate();
      var bankBalance = AppStore.bankAccount().balance();
  
      // Header
      document.getElementById('date').innerHTML = Util.formatDate(AppStore.date());
      document.getElementById('member-count').innerHTML = Util.numberWithCommas(mis.memberUserCount());
  
      // Finance
      document.getElementById('balance').innerHTML = AppStore.bankAccount().decorate().balance();
      document.getElementById('monthly-revenue').innerHTML = dm.monthlyRevenue();
      document.getElementById('monthly-overheads').innerHTML = dm.monthlyOverheads();
      document.getElementById('quarterly-rent-bill').innerHTML = dm.quarterlyRentBill();
      document.getElementById('gross-margin').innerHTML = dm.grossMargin();

      var cashLowEl = document.getElementById('forecast-cash-low');
      cashLowEl.innerHTML = dm.foreCastCashLow();

      var cashLow = mis.foreCastCashLow();
      var revenue = mis.monthlyRevenue();
      var cashLowOverRevenue = cashLow / revenue;

      if (cashLow <= 0) {
        cashLowEl.className = 'text-danger';
      } else if (cashLowOverRevenue < 2) {
        cashLowEl.className = 'text-danger';
      } else if (cashLowOverRevenue < 3) {
        cashLowEl.className = 'text-warning';
      } else {
        cashLowEl.className = '';
      }

      // Product
      document.getElementById('workstation-price').innerHTML = dm.workstationPrice();
      document.getElementById('density').innerHTML = dm.density();

      // Community
      document.getElementById('occupancy').innerHTML = dm.occupancy();
      document.getElementById('monthly-churn-rate').innerHTML = dm.monthlyChurnRate();

      // Sales
      document.getElementById('sales-level').innerHTML = Util.numberWithCommas(AppStore.salesLevel());
      document.getElementById('monthly-sales-volume').innerHTML = dm.monthlySalesVolume();
      document.getElementById('sales-level-up-cost').innerHTML = dm.salesLevelUpCost();

      var salesLevelUpButton = document.getElementById('sales-level-up-button');

      var salesLevelUpCost = AppStore.salesLevelUpCost()
      var cashLowAfterSalesLevelUp = cashLow - AppStore.salesLevelUpCost();
      var cashLowAfterSalesLevelUpOverRevenue = cashLowAfterSalesLevelUp / revenue;

      salesLevelUpButton.disabled = '';

      if (cashLowAfterSalesLevelUp <= 0) {
        salesLevelUpButton.className = 'text-danger';
      } else if (cashLowAfterSalesLevelUpOverRevenue < 2) {
        salesLevelUpButton.className = 'text-danger';
      } else if (cashLowAfterSalesLevelUpOverRevenue < 3) {
        salesLevelUpButton.className = 'text-warning';
      } else {
        salesLevelUpButton.className = '';
      }
      
      if (AppStore.salesLevelUpCost() > bankBalance) {
        salesLevelUpButton.disabled = 'disabled';
      } else {
        salesLevelUpButton.disabled = '';
      }

      // Marketing
      document.getElementById('marketing-level').innerHTML = Util.numberWithCommas(AppStore.marketingLevel());
      document.getElementById('monthly-lead-volume').innerHTML = dm.monthlyLeadVolume();
      document.getElementById('marketing-level-up-cost').innerHTML = dm.marketingLevelUpCost();

      var marketingLevelUpButton = document.getElementById('marketing-level-up-button');

      var marketingLevelUpCost = AppStore.marketingLevelUpCost()
      var cashLowAfterMarketingLevelUp = cashLow - AppStore.marketingLevelUpCost();
      var cashLowAfterMarketingLevelUpOverRevenue = cashLowAfterMarketingLevelUp / revenue;

      marketingLevelUpButton.disabled = '';

      if (cashLowAfterMarketingLevelUp <= 0) {
        marketingLevelUpButton.className = 'text-danger';
      } else if (cashLowAfterMarketingLevelUpOverRevenue < 2) {
        marketingLevelUpButton.className = 'text-danger';
      } else if (cashLowAfterMarketingLevelUpOverRevenue < 3) {
        marketingLevelUpButton.className = 'text-warning';
      } else {
        marketingLevelUpButton.className = '';
      }

      if (AppStore.marketingLevelUpCost() > bankBalance) {
        marketingLevelUpButton.disabled = 'disabled';
      } else {
        marketingLevelUpButton.disabled = '';
      }

      // Development
      document.getElementById('space-count').innerHTML = Util.numberWithCommas(AppStore.spaces().length);
      document.getElementById('space-total-area').innerHTML = dm.totalArea();
  
      var dealsEl = document.getElementById('deals');
  
      var deals = RealEstateMarketStore.deals();

      var newMostRecentDealId;

      if (!deals.length) {
        dealsEl.innerHTML = 'Nothing on the market right now.';
      } else {
        newMostRecentDealId = deals[deals.length - 1].id;

        mostRecentDealId = newMostRecentDealId;
        dealsEl.innerHTML = '';

        RealEstateMarketStore.deals().forEach(function (deal) {
          var lease = deal.lease();

          var el = document.createElement('div');
          el.className = 'border border-right-0 border-bottom-0 border-left-0 pt-2 pb-3';
  
          var priceEl = document.createElement('p');
          priceEl.innerHTML = 'Price: ' + lease.decorate().pricePerSquareFoot();
          el.appendChild(priceEl);
  
          var areaEl = document.createElement('p');
          areaEl.innerHTML = 'Area: ' + lease.decorate().area();
          el.appendChild(areaEl);
  
          var depositEl = document.createElement('p');
          depositEl.innerHTML = 'Deposit: ' + lease.decorate().deposit();
          el.appendChild(depositEl);
  
          var leaseBuyButton = document.createElement('button');
          leaseBuyButton.innerHTML = 'Buy';
          el.appendChild(leaseBuyButton);
  
          if (bankBalance >= lease.deposit()) {
            let cashLowAfterDeposit = cashLow - lease.deposit();
            let cashLowAfterDepositOverRevenue = cashLowAfterDeposit / revenue;

            leaseBuyButton.disabled = '';

            if (cashLowAfterDeposit <= 0) {
              leaseBuyButton.className = 'text-danger';
            } else if (cashLowAfterDepositOverRevenue < 2) {
              leaseBuyButton.className = 'text-danger';
            } else if (cashLowAfterDepositOverRevenue < 3) {
              leaseBuyButton.className = 'text-warning';
            } else {
              leaseBuyButton.className = '';
            }
  
            leaseBuyButton.addEventListener('mousedown', function () {
              LeasePurchaser.call(deal);
            });
          } else {
            leaseBuyButton.disabled = 'disabled';
          }
  
          dealsEl.appendChild(el);
        });
      }

      var projectsEl = document.getElementById('projects');
      projectsEl.innerHTML = '';

      var projects = ProjectStore.projects();

      if (!projects.length) {
        projectsEl.innerHTML = 'No projects right now.';
      } else {
        projects.forEach(function (project) {
          p = project.decorate();

          var el = document.createElement('div');
          el.className = 'border border-right-0 border-bottom-0 border-left-0 pt-2 pb-3';

          var titleEl = document.createElement('h5');
          titleEl.innerHTML = p.title();
          el.appendChild(titleEl);

          var conditionsEl = document.createElement('small');
          conditionsEl.className = 'text-muted'
          conditionsEl.innerHTML = ' ' + p.conditions();
          titleEl.appendChild(conditionsEl);

          var descriptionEl = document.createElement('p');
          descriptionEl.innerHTML = p.description();
          el.appendChild(descriptionEl);

          var goButton = document.createElement('button');
          goButton.innerHTML = 'Go';
          el.appendChild(goButton);

          if (project.conditionsMet()) {
            goButton.disabled = '';

            goButton.addEventListener('mousedown', function () {
              ProjectRunner.call(project);
            });
          } else {
            goButton.disabled = 'disabled';
          }

          projectsEl.appendChild(el);
        });
      }
    }
  };    
})();
