var InterfaceRepainter;

(function () {
  var mostRecentDealId;
  var cachedDealIds = [];
  var cachedProjectIds = [];
  var occupancyGauge;
  var churnGauge;
  var npsGauge;
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
    
    if (!npsGauge) {
      var npsCanvas = document.getElementById('nps-gauge');
      if (npsCanvas) {
        npsGauge = new SimpleGauge({
          canvas: npsCanvas,
          minValue: 0,
          maxValue: 100,
          value: 50, // Start with a neutral NPS
          label: 'NPS',
          colorRanges: [
            { min: 0, max: 30, color: '#dc3545' },  // Red (low NPS is bad)
            { min: 30, max: 70, color: '#ffc107' }, // Yellow
            { min: 70, max: 100, color: '#28a745' } // Green (high NPS is good)
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
            },
            {
              label: 'Profit',
              data: [],
              lineColor: '#9c27b0', // Purple for profit
              fillColor: 'rgba(156, 39, 176, 0.1)'
            }
          ],
          title: 'Financial History',
          yAxisLabel: 'Amount', 
          legend: true
        });
      }
    }
  }

  // Tracking variables to remember which features have been shown
  var featuresShown = {
    salesControls: false,
    marketingControls: false,
    communityEvents: false,
    staffManagement: false
  };
  
  // Helper function to update feature visibility based on progression
  function updateFeatureVisibility() {
    // Skip if ProgressionStore is not available
    if (typeof ProgressionStore === 'undefined') return;
    
    // Check if Projects store is available for completion checks
    var projectStoreAvailable = typeof ProjectStore !== 'undefined' && ProjectStore.isProjectCompleted;
    
    // Update feature visibility based on project completions
    if (projectStoreAvailable && ProgressionStore.features) {
      // Community Events feature is only visible after completing the project
      var showCommunityEvents = ProjectStore.isProjectCompleted("Run Community Events");
      if (showCommunityEvents) {
        ProgressionStore.features.communityEvents.visible = true;
      }
      
      // Sales controls only visible after hiring Sales Manager
      var showSalesControls = ProjectStore.isProjectCompleted("Hire Sales Manager");
      if (showSalesControls) {
        ProgressionStore.features.salesControls.visible = true;
        featuresShown.salesControls = true;
      }
      
      // Marketing controls only visible after hiring Marketing Manager
      var showMarketingControls = ProjectStore.isProjectCompleted("Hire Marketing Manager");
      if (showMarketingControls) {
        ProgressionStore.features.marketingControls.visible = true;
        featuresShown.marketingControls = true;
      }
      
      // Staff management only visible after completing the staff management project
      var showStaffManagement = ProjectStore.isProjectCompleted("Hiring Plan");
      if (showStaffManagement) {
        if (!ProgressionStore.features.staffManagement) {
          ProgressionStore.features.staffManagement = {};
        }
        ProgressionStore.features.staffManagement.visible = true;
        featuresShown.staffManagement = true;
      }
    }
    
    // Get all feature sections
    var featureSections = document.querySelectorAll('.feature-section');
    
    // Update each section's visibility
    featureSections.forEach(function(section) {
      var featureKey = section.getAttribute('data-feature');
      if (featureKey) {
        // Special case for staff management - strictly tied to Hiring Plan project
        if (featureKey === 'staffManagement') {
          var hiringPlanCompleted = false;
          if (projectStoreAvailable) {
            hiringPlanCompleted = ProjectStore.isProjectCompleted("Hiring Plan");
          }
          
          if (hiringPlanCompleted) {
            section.style.display = 'block';
            section.classList.remove('feature-hidden');
            featuresShown.staffManagement = true;
          } else {
            // Always hide if Hiring Plan not completed
            section.style.display = 'none';
            section.classList.add('feature-hidden');
            featuresShown.staffManagement = false;
          }
        }
        // Special handling for Sales and Marketing controls to prevent flickering
        else if (featureKey === 'salesControls' && featuresShown.salesControls) {
          // Once Sales controls are shown, keep them shown
          section.style.display = '';
          section.classList.remove('feature-hidden');
        } else if (featureKey === 'marketingControls' && featuresShown.marketingControls) {
          // Once Marketing controls are shown, keep them shown
          section.style.display = '';
          section.classList.remove('feature-hidden');
        } else if (ProgressionStore.isFeatureVisible(featureKey)) {
          // Normal case - show if feature is visible
          section.style.display = '';
          section.classList.remove('feature-hidden');
          
          // Remember that we've shown these features
          if (featureKey === 'salesControls') featuresShown.salesControls = true;
          if (featureKey === 'marketingControls') featuresShown.marketingControls = true;
          if (featureKey === 'communityEvents') featuresShown.communityEvents = true;
        } else if ((featureKey === 'salesControls' && !featuresShown.salesControls) ||
                   (featureKey === 'marketingControls' && !featuresShown.marketingControls) ||
                   (featureKey === 'communityEvents' && !featuresShown.communityEvents)) {
          // Only hide if we haven't shown it before
          section.style.display = 'none';
          section.classList.add('feature-hidden');
        }
      }
    });
    
    // Special handling for Member Satisfaction panel
    var memberSatisfactionPanel = document.getElementById('member-satisfaction-panel');
    if (memberSatisfactionPanel && projectStoreAvailable) {
      if (ProjectStore.isProjectCompleted("Run Community Events")) {
        memberSatisfactionPanel.style.display = 'block';
      }
    }
  }
  
  InterfaceRepainter = {
    // Expose functions for direct access
    updateFeatureVisibility: updateFeatureVisibility,
    initGauges: initGauges,
    // Expose tracking variables to allow direct access
    featuresShown: featuresShown,
    
    call: function () {
      // Initialize gauges if not already done
      initGauges();
      
      // Update feature visibility based on progression
      updateFeatureVisibility();
      
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
      
      // Update finance chart with revenue, balance, and profit
      if (financeChart) {
        var revenueHistory = mis.getFinancialHistory('revenue');
        var balanceHistory = mis.getFinancialHistory('bankBalance');
        var profitHistory = mis.getFinancialHistory('profit');
        
        if (revenueHistory.length > 0) {
          financeChart.updateData(revenueHistory, 0);
        }
        
        if (balanceHistory.length > 0) {
          financeChart.updateData(balanceHistory, 1);
        }
        
        if (profitHistory.length > 0) {
          financeChart.updateData(profitHistory, 2);
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
      
      // Update NPS gauge if available and MIS has the method
      if (npsGauge && mis.getNpsScore) {
        // Get the current NPS value (don't recalculate here - that happens on a schedule)
        var npsValue = mis.getNpsScore();
        console.log("Updating NPS gauge with current value: " + npsValue);
        npsGauge.updateValue(npsValue);
        
        // Update NPS feedback 
        var npsFeedbackElement = document.getElementById('nps-feedback');
        if (npsFeedbackElement) {
          var feedback = mis.getNpsFeedback ? mis.getNpsFeedback() : "No feedback available";
          
          // Ensure we have feedback content
          if (!feedback || feedback.trim() === "") {
            feedback = "Members are generally satisfied";
          }
          
          npsFeedbackElement.textContent = feedback;
          
          // Set color based on NPS value
          if (npsValue < 30) {
            npsFeedbackElement.style.color = '#dc3545'; // Red for low NPS
          } else if (npsValue < 70) {
            npsFeedbackElement.style.color = '#ffc107'; // Yellow for medium NPS
          } else {
            npsFeedbackElement.style.color = '#28a745'; // Green for high NPS
          }
          
          // Make sure feedback is visible
          npsFeedbackElement.style.display = "block";
        }
        
        // Update community events budget with formatted text
        var eventsBudgetElement = document.getElementById('events-budget');
        if (eventsBudgetElement && dm.eventsBudget) {
          eventsBudgetElement.textContent = dm.eventsBudget();
        }
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
      
      // Style all control buttons
      // Apply consistent button styling
      function styleControlButton(button) {
        if (!button) return;
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
      
      // Style workstation price buttons
      styleControlButton(document.getElementById('increase-workstation-price'));
      styleControlButton(document.getElementById('decrease-workstation-price'));
      
      // Style density buttons
      styleControlButton(document.getElementById('increase-density'));
      styleControlButton(document.getElementById('decrease-density'));
      
      // Style events budget buttons
      styleControlButton(document.getElementById('increase-events-budget'));
      styleControlButton(document.getElementById('decrease-events-budget'));
      
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
                
                // Create button with id for better event handling
                buttonHtml = `<button type="button" id="lease-button-${index}" class="${buttonClass}" 
                    style="padding:5px 15px;border-radius:3px;cursor:pointer;font-weight:bold;${buttonStyle}">
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
                <div class="property-card mb-4 p-3 bg-light rounded">
                    <p><strong>Price:</strong> ${priceText}</p>
                    <p><strong>Area:</strong> ${areaText}</p>
                    <p><strong>Deposit:</strong> ${depositText}</p>
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
        
        // Attach event listeners to each lease button
        deals.forEach(function(deal, index) {
          // Check if player can afford this property
          if (bankBalance >= deal.lease().deposit()) {
            var leaseButtonId = "lease-button-" + index;
            var leaseButton = document.getElementById(leaseButtonId);
            
            if (leaseButton) {
              console.log("Adding event listeners to lease button: " + leaseButtonId);
              
              // Remove any existing listeners and clone the node
              var newButton = leaseButton.cloneNode(true);
              leaseButton.parentNode.replaceChild(newButton, leaseButton);
              
              // Add mousedown event listener
              newButton.addEventListener('mousedown', function(e) {
                e.preventDefault();
                console.log("Lease button clicked (mouse): " + leaseButtonId);
                executeLeasePurchase(this, index);
              });
              
              // Add touch event listeners for mobile
              newButton.addEventListener('touchstart', function(e) {
                e.preventDefault(); // Prevent double events
                this.style.opacity = '0.8'; // Visual feedback
              });
              
              newButton.addEventListener('touchend', function(e) {
                e.preventDefault(); // Prevent double events
                console.log("Lease button clicked (touch): " + leaseButtonId);
                executeLeasePurchase(this, index);
              });
              
              // Function to handle lease purchase
              function executeLeasePurchase(buttonElement, dealIndex) {
                console.log("Executing lease purchase for index: " + dealIndex + " with total deals: " + window.currentDeals.length);
                
                // Disable button immediately
                try {
                  buttonElement.disabled = true;
                  buttonElement.style.opacity = '0.65';
                  buttonElement.style.backgroundColor = '#6c757d';
                  buttonElement.style.border = '1px solid #6c757d';
                } catch (err) {
                  console.error("Error disabling button:", err);
                }
                
                // Execute lease purchase after a tiny delay
                setTimeout(function() {
                  try {
                    // Verify window.currentDeals exists and has the entry
                    if (!window.currentDeals) {
                      console.error("window.currentDeals is undefined!");
                      return;
                    }
                    
                    // Log current deals to help debug
                    console.log("Current deals array length: " + window.currentDeals.length);
                    
                    if (dealIndex >= window.currentDeals.length) {
                      console.error("Deal index " + dealIndex + " is out of bounds (array length: " + window.currentDeals.length + ")");
                      return;
                    }
                    
                    var dealToLease = window.currentDeals[dealIndex];
                    if (!dealToLease) {
                      console.error("No deal found at index " + dealIndex);
                      return;
                    }
                    
                    // Log the deal being leased
                    console.log("Leasing deal: ", dealToLease);
                    var lease = dealToLease.lease();
                    if (!lease) {
                      console.error("Deal has no lease property!");
                      return;
                    }
                    
                    console.log("Lease details - Price: " + lease.pricePerSquareFoot() + ", Area: " + lease.area() + ", Deposit: " + lease.deposit());
                    
                    // Call the lease purchaser
                    LeasePurchaser.call(dealToLease);
                    console.log("Lease purchase successfully executed");
                    
                    // Force UI refresh to show changes
                    needsUiUpdate = true;
                    
                    // Trigger confetti animation for 3 seconds
                    if (typeof ConfettiAnimation !== 'undefined') {
                      console.log("Triggering confetti animation");
                      ConfettiAnimation.start(3000);
                    }
                  } catch (err) {
                    console.error("Error executing lease purchase:", err);
                    alert("There was an error leasing this property. Please try again.");
                  }
                }, 10);
              }
            } else {
              console.error("Could not find lease button with ID: " + leaseButtonId);
            }
          }
        });
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
            
            // Generate unique project ID based on title
            const projectId = project.id ? project.id() : ("project_" + p.title().replace(/\s+/g, "_").toLowerCase());
            const buttonId = `${projectId}-button`;
            
            // Log project condition check
            console.log("Project: " + p.title() + " - ID: " + projectId + " - Conditions met: " + conditionsMet);
            
            // Prepare button HTML based on conditions
            var buttonHtml;
            if (conditionsMet) {
                // Enabled button with more robust onclick handler
                buttonHtml = `<button type="button" id="${buttonId}" class="project-button"
                    style="padding:8px 15px;border-radius:3px;cursor:pointer;font-weight:bold;background-color:#28a745;color:white;border:1px solid #28a745;min-width:80px;min-height:44px;">
                    Go
                </button>`;
            } else {
                // Disabled button with ID for potential future enabling
                buttonHtml = `<button type="button" id="${buttonId}" disabled
                    style="padding:8px 15px;border-radius:3px;font-weight:bold;background-color:#6c757d;color:white;border:1px solid #6c757d;opacity:0.65;min-width:80px;min-height:44px;">
                    Go
                </button>`;
            }
            
            // Build the complete project HTML
            var projectHtml = `
                <div class="project-card mb-4 p-3 bg-light rounded">
                    <h5 class="project-title">${p.title()}<small class="text-muted ms-2"> ${p.conditions()}</small></h5>
                    <p class="project-description mb-3">${p.description()}</p>
                    ${buttonHtml}
                </div>
            `;
            
            // Add to our HTML array
            tempProjectsHtml.push(projectHtml);
        });
        
        // Make the projects available globally 
        window.currentProjects = projects;
        
        // Set all the HTML at once
        projectsEl.innerHTML = tempProjectsHtml.join('');
        
        // Now attach event listeners to each project button properly
        projects.forEach(function(project, index) {
            if (project.conditionsMet()) {
                // Get the unique project ID
                const projectId = project.id ? project.id() : ("project_" + project.title().replace(/\s+/g, "_").toLowerCase());
                const buttonId = `${projectId}-button`;
                const button = document.getElementById(buttonId);
                
                if (button) {
                    console.log("Adding click listener to button: " + buttonId);
                    
                    // Remove any existing listeners and clone the node
                    var newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    // Add click handler to the new button - use both mousedown and touchstart for responsiveness
                    newButton.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        console.log("Project button clicked (mouse): " + projectId);
                        
                        // Execute project (with button already disabled to prevent double-clicks)
                        executeProject(this, index, projectId);
                    });
                    
                    // Add touch handlers for mobile
                    newButton.addEventListener('touchstart', function(e) {
                        e.preventDefault(); // Prevent double events
                        this.style.opacity = '0.8'; // Visual feedback
                    });
                    
                    newButton.addEventListener('touchend', function(e) {
                        e.preventDefault(); // Prevent double events
                        console.log("Project button clicked (touch): " + projectId);
                        
                        // Execute project
                        executeProject(this, index, projectId);
                    });
                    
                    // Function to execute project and handle UI
                    function executeProject(buttonElement, projectIndex, id) {
                        // Disable the button immediately
                        buttonElement.disabled = true;
                        buttonElement.style.opacity = '0.65';
                        buttonElement.style.backgroundColor = '#6c757d';
                        buttonElement.style.border = '1px solid #6c757d';
                        
                        setTimeout(function() {
                            try {
                                const projectToRun = window.currentProjects[projectIndex];
                                if (projectToRun && typeof ProjectRunner !== 'undefined') {
                                    // Log the project being executed
                                    console.log("Executing project: " + id);
                                    
                                    // Call the ProjectRunner
                                    ProjectRunner.call(projectToRun);
                                } else {
                                    console.error("Invalid project reference or ProjectRunner not defined");
                                }
                            } catch (err) {
                                console.error("Error executing project:", err);
                            }
                        }, 10); // Short timeout to ensure UI updates first
                    }
                } else {
                    console.error("Could not find button with ID: " + buttonId);
                }
            }
        });
      }
      
      // Final check to ensure visibility rules are applied
      // This enforces all our feature visibility rules consistently
      updateFeatureVisibility();
      
      // Staff management is now hidden, but we still initialize data in the background
      if (typeof StaffDecorator !== 'undefined' && typeof StaffStore !== 'undefined') {
        // We still need to initialize staff if the hiring plan is completed
        var hiringPlanCompleted = typeof ProjectStore !== 'undefined' && 
                                  ProjectStore.isProjectCompleted && 
                                  ProjectStore.isProjectCompleted('Hiring Plan');
        
        if (hiringPlanCompleted) {
          featuresShown.staffManagement = true;
          
          // Initialize staff in the background
          if (typeof StaffStore.init === 'function') {
            StaffStore.init();
          }
        }
      }
      
      // Apply animations to newly visible elements
      try {
        var newlyVisibleFeatures = document.querySelectorAll('.feature-section:not(.feature-hidden):not(.animated)');
        for (var i = 0; i < newlyVisibleFeatures.length; i++) {
          var element = newlyVisibleFeatures[i];
          // Add fadeIn animation to newly visible features
          element.style.animation = 'fadeIn 0.4s ease-out';
          element.classList.add('animated');
          
          // Add pulse animation to buttons in newly visible features
          var buttons = element.querySelectorAll('button');
          for (var j = 0; j < buttons.length; j++) {
            buttons[j].style.animation = 'pulse 0.8s ease-out';
          }
        }
        
        // Apply pulse animation to important finance items when in danger zone
        var financeItems = document.querySelectorAll('.finance-item');
        for (var k = 0; k < financeItems.length; k++) {
          var item = financeItems[k];
          var valueSpan = item.querySelector('span');
          if (valueSpan && valueSpan.classList.contains('text-danger')) {
            if (!item.classList.contains('pulse-animation')) {
              item.classList.add('pulse-animation');
            }
          } else {
            item.classList.remove('pulse-animation');
          }
        }
        
        // Apply pulse animation to cash low meter when in danger
        var cashLowMeter = document.getElementById('cash-low-meter');
        var forecastSpan = document.getElementById('forecast-cash-low');
        if (cashLowMeter && forecastSpan && forecastSpan.classList.contains('text-danger')) {
          if (!cashLowMeter.classList.contains('pulse-animation')) {
            cashLowMeter.classList.add('pulse-animation');
          }
        } else if (cashLowMeter) {
          cashLowMeter.classList.remove('pulse-animation');
        }
      } catch (e) {
        console.error("Error applying animations:", e);
      }
    }
  };
})();