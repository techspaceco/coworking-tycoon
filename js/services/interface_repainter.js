var InterfaceRepainter;

(function () {
  var mostRecentDealId;
  var cachedDealIds = [];
  var cachedProjectIds = [];
  var occupancyGauge;
  var churnGauge;
  var financeChart;
  
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
  
  // Initialize gauges and charts
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
    
    if (!financeChart) {
      var financeCanvas = document.getElementById('finance-chart');
      if (financeCanvas) {
        financeChart = new SimpleLineChart({
          canvas: financeCanvas,
          datasets: [
            {
              label: 'Revenue',
              data: [],
              lineColor: '#28a745', // Green for revenue
              fillColor: 'rgba(40, 167, 69, 0.1)'
            },
            {
              label: 'Balance',
              data: [],
              lineColor: '#007bff', // Blue for balance
              fillColor: 'rgba(0, 123, 255, 0.1)'
            }
          ],
          title: 'Financial History',
          yAxisLabel: 'Amount', 
          legend: true
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
      
      // Update finance chart with revenue and balance
      if (financeChart) {
        var revenueHistory = mis.getFinancialHistory('revenue');
        var balanceHistory = mis.getFinancialHistory('bankBalance');
        
        if (revenueHistory.length > 0) {
          financeChart.updateData(revenueHistory, 0);
        }
        
        if (balanceHistory.length > 0) {
          financeChart.updateData(balanceHistory, 1);
        }
      }
      // Cash low with visual meter
      updateElement('forecast-cash-low', dm.foreCastCashLow(), cashLowClass);
      
      // Update cash low meter
      var cashLowMeter = document.getElementById('cash-low-meter');
      if (cashLowMeter) {
        var bankBalance = AppStore.bankAccount().balance();
        var cashLow = mis.foreCastCashLow();
        var revenue = mis.monthlyRevenue();
        
        // Calculate ratio for visual representation
        var ratio = revenue === 0 ? 0 : cashLow / revenue;
        // Cap at a max of 6 months of revenue for the meter
        var percentFill = Math.min(Math.max(ratio / 6, 0), 1) * 100;
        
        // Set meter style based on health
        var meterColor;
        if (cashLow <= 0 || ratio < 1) {
          meterColor = '#dc3545'; // Red - danger
        } else if (ratio < 2) {
          meterColor = '#ffc107'; // Yellow - warning
        } else if (ratio < 3) {
          meterColor = '#17a2b8'; // Blue - acceptable
        } else {
          meterColor = '#28a745'; // Green - good
        }
        
        cashLowMeter.style.width = percentFill + '%';
        cashLowMeter.style.backgroundColor = meterColor;
      }
      
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
        // Clear the deals display and redraw everything from scratch
        dealsEl.innerHTML = '';
        
        // Create a temporary container to hold the deal listing HTML
        var tempDealsHtml = [];
        
        // We'll create the HTML for each deal and append to an array
        deals.forEach(function(deal, index) {
            var lease = deal.lease();
            
            // Get lease details
            var priceText = lease.decorate().pricePerSquareFoot();
            var areaText = lease.decorate().area();
            var depositValue = lease.deposit();
            var depositText = lease.decorate().deposit();
            
            // Check if player can afford this property
            var canAfford = bankBalance >= depositValue;
            let buttonHtml;
            
            // Create HTML for button based on affordability
            if (canAfford) {
                let buttonClass = 'lease-button';
                let buttonColor;
                let textColor;
                let buttonStyle;
                
                let cashLowAfterDeposit = cashLow - depositValue;
                let cashLowAfterDepositOverRevenue = revenue === 0 ? 0 : cashLowAfterDeposit / revenue;
                
                // Set button class based on financial impact
                if (cashLowAfterDeposit <= 0 || cashLowAfterDepositOverRevenue < 2) {
                    buttonColor = '#dc3545'; // Red - danger
                    textColor = 'white';
                    buttonClass += ' lease-btn-red';
                } else if (cashLowAfterDepositOverRevenue < 3) {
                    buttonColor = '#ffc107'; // Yellow - warning
                    textColor = 'black';
                    buttonClass += ' lease-btn-yellow';
                } else {
                    buttonColor = '#28a745'; // Green - good
                    textColor = 'white';
                    buttonClass += ' lease-btn-green';
                }
                
                buttonStyle = `background-color:${buttonColor};color:${textColor};border:1px solid ${buttonColor};`;
                
                // Create the button with direct inline onclick handler that calls LeasePurchaser immediately
                buttonHtml = `<button type="button" class="${buttonClass}" 
                    style="padding:5px 15px;border-radius:3px;cursor:pointer;font-weight:bold;${buttonStyle}"
                    onclick="LeasePurchaser.call(window.currentDeals[${index}]);this.disabled=true;this.style.opacity='0.65';this.style.backgroundColor='#6c757d';this.style.border='1px solid #6c757d';">
                    Lease
                </button>`;
            } else {
                // Disabled button styling
                buttonHtml = `<button type="button" disabled
                    style="padding:5px 15px;border-radius:3px;font-weight:bold;background-color:#6c757d;color:white;border:1px solid #6c757d;opacity:0.65;">
                    Lease
                </button>`;
            }
            
            // Build the complete HTML for this deal
            var dealHtml = `
                <div class="border border-right-0 border-bottom-0 border-left-0 pt-2 pb-3">
                    <p>Price: ${priceText}</p>
                    <p>Area: ${areaText}</p>
                    <p>Deposit: ${depositText}</p>
                    ${buttonHtml}
                </div>
            `;
            
            // Add this deal's HTML to our array
            tempDealsHtml.push(dealHtml);
        });
        
        // Make the deals available globally for the inline handlers to access
        window.currentDeals = deals;
        
        // Set all the HTML at once
        dealsEl.innerHTML = tempDealsHtml.join('');
      }

      // ALWAYS redraw projects - disable caching for now
      var projectsEl = document.getElementById('projects');
      var projects = ProjectStore.projects();
      
      if (!projects.length) {
        projectsEl.innerHTML = 'No projects right now.';
      } else {
        // Clear the entire projects list
        projectsEl.innerHTML = '';
        
        // Create a temporary array to hold the project HTML
        var tempProjectsHtml = [];
        
        // Process each project
        projects.forEach(function(project, index) {
            var p = project.decorate();
            var conditionsMet = project.conditionsMet();
            
            // Log project condition check
            console.log("Project: " + p.title() + " - Conditions met: " + conditionsMet);
            
            // Prepare button HTML based on conditions
            var buttonHtml;
            if (conditionsMet) {
                // Enabled button with inline handler
                buttonHtml = `<button type="button" class="project-button"
                    style="padding:5px 15px;border-radius:3px;cursor:pointer;font-weight:bold;background-color:#28a745;color:white;border:1px solid #28a745;"
                    onclick="ProjectRunner.call(window.currentProjects[${index}]);this.disabled=true;this.style.opacity='0.65';this.style.backgroundColor='#6c757d';this.style.border='1px solid #6c757d';">
                    Go
                </button>`;
            } else {
                // Disabled button
                buttonHtml = `<button type="button" disabled
                    style="padding:5px 15px;border-radius:3px;font-weight:bold;background-color:#6c757d;color:white;border:1px solid #6c757d;opacity:0.65;">
                    Go
                </button>`;
            }
            
            // Build the complete project HTML
            var projectHtml = `
                <div class="border border-right-0 border-bottom-0 border-left-0 pt-2 pb-3">
                    <h5>${p.title()}<small class="text-muted"> ${p.conditions()}</small></h5>
                    <p>${p.description()}</p>
                    ${buttonHtml}
                </div>
            `;
            
            // Add to our HTML array
            tempProjectsHtml.push(projectHtml);
        });
        
        // Make the projects available globally for the inline handlers to access
        window.currentProjects = projects;
        
        // Set all the HTML at once
        projectsEl.innerHTML = tempProjectsHtml.join('');
      }
    }
  };
})();
