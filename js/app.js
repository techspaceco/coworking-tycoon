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
    Logger.log('Welcome to Coworking Tycoon.');

    // Helper function to add both mouse and touch events
    function addButtonEvents(button, action) {
      // For desktop
      button.addEventListener('mousedown', function(e) {
        action();
        needsUiUpdate = true;
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
    });

    var increaseWorkstationPriceButton = document.getElementById('increase-workstation-price');
    addButtonEvents(increaseWorkstationPriceButton, function() {
      AppStore.incrementWorkstationPrice();
    });

    var decreaseDensityButton = document.getElementById('decrease-density');
    addButtonEvents(decreaseDensityButton, function() {
      AppStore.decrementDensity();
    });

    var increaseDensityButton = document.getElementById('increase-density');
    addButtonEvents(increaseDensityButton, function() {
      AppStore.incrementDensity();
    });
  }

  function handleQuarterChange() {
    QuarterlyRentPayer.call();
    needsUiUpdate = true;
  }

  function handleMonthChange() {
    MonthlyLicenceFeeCollector.call();
    MonthlyBillPayer.call();
    
    // Record financial data for charting at each month
    AppStore.managementInformationSystem().recordFinancialData();
    
    needsUiUpdate = true;
  }

  function handleDayChange() {
    var mis = AppStore.managementInformationSystem();
    DailyChurn.call();
    mis.recalculateMonthlyChurn();
    needsUiUpdate = true;
  }

  function updateUI() {
    if (needsUiUpdate) {
      InterfaceRepainter.call();
      needsUiUpdate = false;
    }
  }

  function gameLoop() {
    if (AppStore.spaces().length === 0) {
      return;
    }

    Util.addDay(date);

    if (AppStore.bankAccount().isOverLimit()) {
      Logger.log('You went bust!');
      clearInterval(gameInterval);
      clearInterval(uiInterval);
      return;
    }

    SalesGenerator.call(LeadGenerator.call());

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

    handleDayChange();
  }

  setTimeout(init, 0);
  gameInterval = setInterval(gameLoop, gameSpeed);
  uiInterval = setInterval(updateUI, uiRefreshRate);
})();
