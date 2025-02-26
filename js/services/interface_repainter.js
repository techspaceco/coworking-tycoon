var InterfaceRepainter;

(function () {
  var mostRecentDealId;
  var cachedDealIds = [];
  var cachedProjectIds = [];
  var occupancyGauge;
  var churnGauge;
  
  // Helper to update text content and class only when changed
  function updateElement(id, content, className) {
    var el = document.getElementById(id);
    if (el.innerHTML !== content) {
      el.innerHTML = content;
    }
    if (className !== undefined && el.className !== className) {
      el.className = className;
    }
  }
  
  // Initialize gauges
  function initGauges() {
    if (!occupancyGauge) {
      var occupancyCanvas = document.getElementById('occupancy-gauge');
      if (occupancyCanvas) {
        occupancyGauge = new SimpleGauge({
          canvas: occupancyCanvas,
          minValue: 0,
          maxValue: 100,
          value: 0,
          label: 'Occupancy',
          colorRanges: [
            { min: 0, max: 33, color: '#dc3545' },  // Red (low occupancy is bad)
            { min: 33, max: 66, color: '#ffc107' }, // Yellow
            { min: 66, max: 100, color: '#28a745' } // Green (high occupancy is good)
          ]
        });
      }
    }
    
    if (!churnGauge) {
      var churnCanvas = document.getElementById('churn-gauge');
      if (churnCanvas) {
        churnGauge = new SimpleGauge({
          canvas: churnCanvas,
          minValue: 0,
          maxValue: 100,
          value: 0,
          label: 'Churn Rate',
          invertColors: true,
          colorRanges: [
            { min: 0, max: 33, color: '#28a745' },  // Green (low churn is good)
            { min: 33, max: 66, color: '#ffc107' }, // Yellow
            { min: 66, max: 100, color: '#dc3545' } // Red (high churn is bad)
          ]
        });
      }
    }
  }

  InterfaceRepainter = {
    call: function () {
      // Initialize gauges if not already done
      initGauges();
      
      var mis = AppStore.managementInformationSystem();
      var dm = mis.decorate();
      var bankBalance = AppStore.bankAccount().balance();
      var cashLow = mis.foreCastCashLow();
      var revenue = mis.monthlyRevenue();
      var cashLowOverRevenue = revenue === 0 ? 0 : cashLow / revenue;
      
      // Determine classes outside of DOM operations
      var cashLowClass = '';
      if (cashLow <= 0 || cashLowOverRevenue < 2) {
        cashLowClass = 'text-danger';
      } else if (cashLowOverRevenue < 3) {
        cashLowClass = 'text-warning';
      }
      
      // Header
      updateElement('date', Util.formatDate(AppStore.date()));
      updateElement('member-count', Util.numberWithCommas(mis.memberUserCount()));
  
      // Finance
      updateElement('balance', AppStore.bankAccount().decorate().balance());
      updateElement('monthly-revenue', dm.monthlyRevenue());
      updateElement('monthly-overheads', dm.monthlyOverheads());
      updateElement('quarterly-rent-bill', dm.quarterlyRentBill());
      updateElement('gross-margin', dm.grossMargin());
      updateElement('forecast-cash-low', dm.foreCastCashLow(), cashLowClass);
      
      // Product
      updateElement('workstation-price', dm.workstationPrice());
      updateElement('density', dm.density());

      // Community
      updateElement('occupancy', dm.occupancy());
      updateElement('monthly-churn-rate', dm.monthlyChurnRate());
      
      // Update gauges
      if (occupancyGauge) {
        // Extract numerical value from occupancy percentage
        var occupancyValue = parseInt(mis.occupancy() * 100);
        occupancyGauge.updateValue(occupancyValue);
      }
      
      if (churnGauge) {
        // Extract numerical value from churn rate percentage
        var churnValue = parseInt(mis.monthlyChurnRate() * 100);
        // Cap at 100% for display
        churnValue = Math.min(churnValue, 100);
        churnGauge.updateValue(churnValue);
      }

      // Sales
      updateElement('sales-level', Util.numberWithCommas(AppStore.salesLevel()));
      updateElement('monthly-sales-volume', dm.monthlySalesVolume());
      updateElement('sales-level-up-cost', dm.salesLevelUpCost());

      var salesLevelUpButton = document.getElementById('sales-level-up-button');
      var salesLevelUpCost = AppStore.salesLevelUpCost();
      var cashLowAfterSalesLevelUp = cashLow - salesLevelUpCost;
      var cashLowAfterSalesLevelUpOverRevenue = revenue === 0 ? 0 : cashLowAfterSalesLevelUp / revenue;
      
      // Apply consistent button styling
      salesLevelUpButton.style.padding = '5px 15px';
      salesLevelUpButton.style.borderRadius = '3px';
      salesLevelUpButton.style.cursor = 'pointer';
      salesLevelUpButton.style.fontWeight = 'bold';
      
      if (salesLevelUpCost > bankBalance) {
        // Can't afford - disabled
        salesLevelUpButton.disabled = true;
        salesLevelUpButton.style.backgroundColor = '#6c757d';
        salesLevelUpButton.style.color = 'white';
        salesLevelUpButton.style.border = '1px solid #6c757d';
        salesLevelUpButton.style.opacity = '0.65';
      } else if (cashLowAfterSalesLevelUp <= 0 || cashLowAfterSalesLevelUpOverRevenue < 2) {
        // Can afford but dangerous - red
        salesLevelUpButton.disabled = false;
        salesLevelUpButton.style.backgroundColor = '#dc3545';
        salesLevelUpButton.style.color = 'white';
        salesLevelUpButton.style.border = '1px solid #dc3545';
        salesLevelUpButton.style.opacity = '1';
      } else if (cashLowAfterSalesLevelUpOverRevenue < 3) {
        // Can afford but risky - yellow
        salesLevelUpButton.disabled = false;
        salesLevelUpButton.style.backgroundColor = '#ffc107';
        salesLevelUpButton.style.color = 'black';
        salesLevelUpButton.style.border = '1px solid #ffc107';
        salesLevelUpButton.style.opacity = '1';
      } else {
        // Can afford safely - green
        salesLevelUpButton.disabled = false;
        salesLevelUpButton.style.backgroundColor = '#28a745';
        salesLevelUpButton.style.color = 'white';
        salesLevelUpButton.style.border = '1px solid #28a745';
        salesLevelUpButton.style.opacity = '1';
      }

      // Marketing
      updateElement('marketing-level', Util.numberWithCommas(AppStore.marketingLevel()));
      updateElement('monthly-lead-volume', dm.monthlyLeadVolume());
      updateElement('marketing-level-up-cost', dm.marketingLevelUpCost());

      var marketingLevelUpButton = document.getElementById('marketing-level-up-button');
      var marketingLevelUpCost = AppStore.marketingLevelUpCost();
      var cashLowAfterMarketingLevelUp = cashLow - marketingLevelUpCost;
      var cashLowAfterMarketingLevelUpOverRevenue = revenue === 0 ? 0 : cashLowAfterMarketingLevelUp / revenue;
      
      // Apply consistent button styling
      marketingLevelUpButton.style.padding = '5px 15px';
      marketingLevelUpButton.style.borderRadius = '3px';
      marketingLevelUpButton.style.cursor = 'pointer';
      marketingLevelUpButton.style.fontWeight = 'bold';
      
      if (marketingLevelUpCost > bankBalance) {
        // Can't afford - disabled
        marketingLevelUpButton.disabled = true;
        marketingLevelUpButton.style.backgroundColor = '#6c757d';
        marketingLevelUpButton.style.color = 'white';
        marketingLevelUpButton.style.border = '1px solid #6c757d';
        marketingLevelUpButton.style.opacity = '0.65';
      } else if (cashLowAfterMarketingLevelUp <= 0 || cashLowAfterMarketingLevelUpOverRevenue < 2) {
        // Can afford but dangerous - red
        marketingLevelUpButton.disabled = false;
        marketingLevelUpButton.style.backgroundColor = '#dc3545';
        marketingLevelUpButton.style.color = 'white';
        marketingLevelUpButton.style.border = '1px solid #dc3545';
        marketingLevelUpButton.style.opacity = '1';
      } else if (cashLowAfterMarketingLevelUpOverRevenue < 3) {
        // Can afford but risky - yellow
        marketingLevelUpButton.disabled = false;
        marketingLevelUpButton.style.backgroundColor = '#ffc107';
        marketingLevelUpButton.style.color = 'black';
        marketingLevelUpButton.style.border = '1px solid #ffc107';
        marketingLevelUpButton.style.opacity = '1';
      } else {
        // Can afford safely - green
        marketingLevelUpButton.disabled = false;
        marketingLevelUpButton.style.backgroundColor = '#28a745';
        marketingLevelUpButton.style.color = 'white';
        marketingLevelUpButton.style.border = '1px solid #28a745';
        marketingLevelUpButton.style.opacity = '1';
      }

      // Development
      updateElement('space-count', Util.numberWithCommas(AppStore.spaces().length));
      updateElement('space-total-area', dm.totalArea());
      
      // Style the workstation price buttons
      var increaseWorkstationPriceButton = document.getElementById('increase-workstation-price');
      var decreaseWorkstationPriceButton = document.getElementById('decrease-workstation-price');
      
      // Apply consistent button styling
      function styleControlButton(button) {
        button.style.padding = '2px 10px';
        button.style.borderRadius = '3px';
        button.style.cursor = 'pointer';
        button.style.fontWeight = 'bold';
        button.style.backgroundColor = '#17a2b8'; // Info blue for control buttons
        button.style.color = 'white';
        button.style.border = '1px solid #17a2b8';
        button.style.margin = '0 2px';
        button.style.fontSize = '16px';
      }
      
      styleControlButton(increaseWorkstationPriceButton);
      styleControlButton(decreaseWorkstationPriceButton);
      
      // Style the density buttons
      var increaseDensityButton = document.getElementById('increase-density');
      var decreaseDensityButton = document.getElementById('decrease-density');
      
      styleControlButton(increaseDensityButton);
      styleControlButton(decreaseDensityButton);
      
      // Debug panel removed as requested
  
      // Always redraw deals to ensure buttons update with bank balance changes
      var dealsEl = document.getElementById('deals');
      var deals = RealEstateMarketStore.deals();
      
      if (!deals.length) {
        dealsEl.innerHTML = 'Nothing on the market right now.';
      } else {
        mostRecentDealId = deals[deals.length - 1].id;
        dealsEl.innerHTML = '';

        var dealFragment = document.createDocumentFragment();
        deals.forEach(function (deal) {
          var lease = deal.lease();
          
          // Assign ID to identify the deal
          var dealId = (typeof deal.id === 'function') ? deal.id() : "deal_" + lease.area() + "_" + lease.pricePerSquareFoot();

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
          leaseBuyButton.id = 'buy-button-' + dealId;
          leaseBuyButton.style.padding = '5px 15px';
          leaseBuyButton.style.borderRadius = '3px';
          leaseBuyButton.style.cursor = 'pointer';
          leaseBuyButton.style.fontWeight = 'bold';
          el.appendChild(leaseBuyButton);
  
          // Check if we can afford this property
          var canAfford = bankBalance >= lease.deposit();
          
          if (canAfford) {
            let cashLowAfterDeposit = cashLow - lease.deposit();
            let cashLowAfterDepositOverRevenue = revenue === 0 ? 0 : cashLowAfterDeposit / revenue;
            
            leaseBuyButton.disabled = false;
            
            if (cashLowAfterDeposit <= 0 || cashLowAfterDepositOverRevenue < 2) {
              leaseBuyButton.style.backgroundColor = '#dc3545';
              leaseBuyButton.style.color = 'white';
              leaseBuyButton.style.border = '1px solid #dc3545';
            } else if (cashLowAfterDepositOverRevenue < 3) {
              leaseBuyButton.style.backgroundColor = '#ffc107';
              leaseBuyButton.style.color = 'black';
              leaseBuyButton.style.border = '1px solid #ffc107';
            } else {
              leaseBuyButton.style.backgroundColor = '#28a745';
              leaseBuyButton.style.color = 'white';
              leaseBuyButton.style.border = '1px solid #28a745';
            }
          } else {
            leaseBuyButton.disabled = true;
            leaseBuyButton.style.backgroundColor = '#6c757d';
            leaseBuyButton.style.color = 'white';
            leaseBuyButton.style.border = '1px solid #6c757d';
            leaseBuyButton.style.opacity = '0.65';
          }
          
          dealFragment.appendChild(el);
        });
        
        dealsEl.appendChild(dealFragment);
        
        // Add event listeners after all elements are in DOM
        deals.forEach(function (deal) {
          var lease = deal.lease();
          var dealId = (typeof deal.id === 'function') ? deal.id() : "deal_" + lease.area() + "_" + lease.pricePerSquareFoot();
          var buttonId = 'buy-button-' + dealId;
          var button = document.getElementById(buttonId);
          
          if (button && !button.disabled) {
            // Function to execute when button is activated
            function purchaseLease(e) {
              // Prevent default and stop propagation for reliability
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              
              console.log("Purchasing property: " + lease.decorate().area());
              LeasePurchaser.call(deal);
              
              return false;
            }
            
            // Remove any existing listeners to prevent duplicates
            var newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add click handler for desktop
            newButton.onclick = purchaseLease;
            
            // Add touch handlers for mobile
            newButton.addEventListener('touchstart', function(e) {
              // Add active state styling
              newButton.style.opacity = '0.8';
            }, false);
            
            newButton.addEventListener('touchend', function(e) {
              // Remove active state styling
              newButton.style.opacity = '1';
              purchaseLease(e);
            }, false);
          }
        });
      }

      // ALWAYS redraw projects - disable caching for now
      var projectsEl = document.getElementById('projects');
      var projects = ProjectStore.projects();
      
      if (!projects.length) {
        projectsEl.innerHTML = 'No projects right now.';
      } else {
        projectsEl.innerHTML = '';
        
        projects.forEach(function (project) {
          var p = project.decorate();
          var conditionsMet = project.conditionsMet();
          
          // Log every project condition check
          console.log("Project: " + p.title() + " - Conditions met: " + conditionsMet);

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
          goButton.id = 'project-button-' + project.id();
          
          // Apply consistent styling with lease buttons
          goButton.style.padding = '5px 15px';
          goButton.style.borderRadius = '3px';
          goButton.style.cursor = 'pointer';
          goButton.style.fontWeight = 'bold';
          
          // Set button enabled state
          if (conditionsMet) {
            goButton.disabled = false;
            goButton.style.backgroundColor = '#28a745';
            goButton.style.color = 'white';
            goButton.style.border = '1px solid #28a745';
          } else {
            goButton.disabled = true;
            goButton.style.backgroundColor = '#6c757d';
            goButton.style.color = 'white';
            goButton.style.border = '1px solid #6c757d';
            goButton.style.opacity = '0.65';
          }
          
          el.appendChild(goButton);
          projectsEl.appendChild(el);
        });
        
        // Add robust event listeners after all elements are in the DOM
        projects.forEach(function (project) {
          var buttonId = 'project-button-' + project.id();
          var button = document.getElementById(buttonId);
          
          if (button && !button.disabled && project.conditionsMet()) {
            // Remove any existing listeners to prevent duplicates
            var newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Function to execute when button is activated
            function executeProject(e) {
              // Prevent default and stop propagation for reliability
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              
              console.log("Running project: " + project.title());
              
              // Disable the button immediately to prevent double-clicks
              newButton.disabled = true;
              newButton.style.backgroundColor = '#6c757d';
              newButton.style.opacity = '0.65';
              
              // Execute the project
              setTimeout(function() {
                ProjectRunner.call(project);
              }, 50);
              
              return false;
            }
            
            // Add click handler for desktop
            newButton.onclick = executeProject;
            
            // Add touch handlers for mobile
            newButton.addEventListener('touchstart', function(e) {
              // Add active state styling
              newButton.style.opacity = '0.8';
            }, false);
            
            newButton.addEventListener('touchend', function(e) {
              // Remove active state styling
              newButton.style.opacity = '1';
              executeProject(e);
            }, false);
          }
        });
      }
    }
  };
})();
