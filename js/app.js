// Define needsUiUpdate globally so all modules can access it
var needsUiUpdate = true;

(function () {
  var date = AppStore.date();
  var currentQuarter = Util.getQuarter(date);
  var currentMonth = date.getMonth();
  var gameInterval;
  var uiInterval;
  var gameSpeed = 100; // ms between game ticks
  var uiRefreshRate = 200; // ms between UI updates

  function init() {
    Logger.log('Welcome to Coworking Tycoon! Start by acquiring your first property in the Real Estate Market.');
    
    // Initialize progression if available
    if (typeof ProgressionStore !== 'undefined') {
      ProgressionStore.init();
    }

    // Helper function to add both mouse and touch events
    function addButtonEvents(button, action) {
      // For desktop
      button.addEventListener('mousedown', function(e) {
        action();
        needsUiUpdate = true;
        
        // Unlock events after user interaction
        if (typeof EventStore !== 'undefined') {
          EventStore.unlockEvents();
        }
      });
      
      // For mobile
      button.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent double events
        button.style.opacity = '0.8'; // Visual feedback
      });
      
      button.addEventListener('touchend', function(e) {
        e.preventDefault(); // Prevent double events
        button.style.opacity = '1'; // Restore opacity
        action();
        needsUiUpdate = true;
        
        // Unlock events after user interaction
        if (typeof EventStore !== 'undefined') {
          EventStore.unlockEvents();
        }
      });
    }

    var marketingLevelUpButton = document.getElementById('marketing-level-up-button');
    addButtonEvents(marketingLevelUpButton, function() {
      AppStore.incrementMarketingLevel();
    });

    var salesLevelUpButton = document.getElementById('sales-level-up-button');
    addButtonEvents(salesLevelUpButton, function() {
      AppStore.incrementSalesLevel();
    });

    var decreaseWorkstationPriceButton = document.getElementById('decrease-workstation-price');
    addButtonEvents(decreaseWorkstationPriceButton, function() {
      AppStore.decrementWorkstationPrice();
      // Update NPS when price changes
      var mis = AppStore.managementInformationSystem();
      if (mis.calculateNps) {
        setTimeout(function() { mis.calculateNps(); }, 10);
      }
    });

    var increaseWorkstationPriceButton = document.getElementById('increase-workstation-price');
    addButtonEvents(increaseWorkstationPriceButton, function() {
      AppStore.incrementWorkstationPrice();
      // Update NPS when price changes
      var mis = AppStore.managementInformationSystem();
      if (mis.calculateNps) {
        setTimeout(function() { mis.calculateNps(); }, 10);
      }
    });

    var decreaseDensityButton = document.getElementById('decrease-density');
    addButtonEvents(decreaseDensityButton, function() {
      AppStore.decrementDensity();
      // Update NPS when density changes
      var mis = AppStore.managementInformationSystem();
      if (mis.calculateNps) {
        setTimeout(function() { mis.calculateNps(); }, 10);
      }
    });

    var increaseDensityButton = document.getElementById('increase-density');
    addButtonEvents(increaseDensityButton, function() {
      AppStore.incrementDensity();
      // Update NPS when density changes
      var mis = AppStore.managementInformationSystem();
      if (mis.calculateNps) {
        setTimeout(function() { mis.calculateNps(); }, 10);
      }
    });
    
    // Community events budget controls
    var decreaseEventsBudgetButton = document.getElementById('decrease-events-budget');
    addButtonEvents(decreaseEventsBudgetButton, function() {
      var mis = AppStore.managementInformationSystem();
      if (mis.decrementCommunityEventsPerMember) {
        mis.decrementCommunityEventsPerMember();
        // Update NPS when events budget changes
        if (mis.calculateNps) {
          setTimeout(function() { mis.calculateNps(); }, 10);
        }
      }
    });
    
    var increaseEventsBudgetButton = document.getElementById('increase-events-budget');
    addButtonEvents(increaseEventsBudgetButton, function() {
      var mis = AppStore.managementInformationSystem();
      if (mis.incrementCommunityEventsPerMember) {
        mis.incrementCommunityEventsPerMember();
        // Update NPS when events budget changes
        if (mis.calculateNps) {
          setTimeout(function() { mis.calculateNps(); }, 10);
        }
      }
    });
  }

  function handleQuarterChange() {
    QuarterlyRentPayer.call();
    
    // Check for quarterly events
    if (typeof EventStore !== 'undefined') {
      EventStore.checkForQuarterlyEvent();
    }
    
    needsUiUpdate = true;
  }

  function handleMonthChange() {
    MonthlyLicenceFeeCollector.call();
    MonthlyBillPayer.call();
    
    // Check for monthly events
    if (typeof EventStore !== 'undefined') {
      EventStore.checkForMonthlyEvent();
    }
    
    // Record financial data for charting at each month
    AppStore.managementInformationSystem().recordFinancialData();
    
    needsUiUpdate = true;
  }

  // Counter for periodic NPS updates
  var daysSinceNpsUpdate = 0;
  
  function handleDayChange() {
    var mis = AppStore.managementInformationSystem();
    
    // Check for random events
    if (typeof EventStore !== 'undefined') {
      EventStore.checkForDailyEvent();
    }
    
    DailyChurn.call();
    mis.recalculateMonthlyChurn();
    
    // Calculate NPS score periodically rather than every day
    // This makes changes more noticeable to the player
    daysSinceNpsUpdate++;
    if (daysSinceNpsUpdate >= 1) { // Calculate NPS every day for more responsiveness
      // Recalculate NPS if the method exists
      if (mis.calculateNps) {
        console.log("Performing scheduled NPS update");
        mis.calculateNps();
        
        // Force UI update after NPS calculation
        needsUiUpdate = true;
      }
      daysSinceNpsUpdate = 0;
    }
    
    // Check progression criteria
    if (typeof ProgressionStore !== 'undefined') {
      if (ProgressionStore.updateProgression()) {
        // If progression changed, we need to update UI
        needsUiUpdate = true;
      }
    }
    
    needsUiUpdate = true;
  }

  function updateUI() {
    if (needsUiUpdate && typeof InterfaceRepainter !== 'undefined') {
      InterfaceRepainter.call();
      needsUiUpdate = false;
    }
  }

  // Keep track of days for real estate market refresh
  var daysSinceMarketRefresh = 0;
  
  function gameLoop() {
    Util.addDay(date);
    
    // Even if no spaces, we want to update the UI to show real estate deals
    needsUiUpdate = true;

    if (AppStore.bankAccount().isOverLimit()) {
      Logger.log('You went bust!');
      clearInterval(gameInterval);
      clearInterval(uiInterval);
      
      // Display game over alert
      alert('GAME OVER: You went bust! Your bank account went over the limit.');
      return;
    }

    // Skip lead/sale generation if no spaces yet
    if (AppStore.spaces().length > 0) {
      SalesGenerator.call(LeadGenerator.call());
    }

    var newMonth = date.getMonth();
    if (newMonth !== currentMonth) {
      currentMonth = newMonth;
      handleMonthChange();
    }

    var newQuarter = Util.getQuarter(date);
    if (newQuarter !== currentQuarter) {
      currentQuarter = newQuarter;
      handleQuarterChange();
    }

    // Refresh real estate market periodically
    daysSinceMarketRefresh++;
    if (daysSinceMarketRefresh >= 7) { // Every week
      console.log("Weekly market refresh");
      // Force deals refresh by calling the function
      RealEstateMarketStore.deals();
      daysSinceMarketRefresh = 0;
      needsUiUpdate = true;
    }

    handleDayChange();
  }

  setTimeout(init, 0);
  gameInterval = setInterval(gameLoop, gameSpeed);
  uiInterval = setInterval(updateUI, uiRefreshRate);
})();
