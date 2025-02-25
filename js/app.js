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

    var marketingLevelUpButton = document.getElementById('marketing-level-up-button');
    marketingLevelUpButton.addEventListener('mousedown', function () {
      AppStore.incrementMarketingLevel();
      needsUiUpdate = true;
    });

    var salesLevelUpButton = document.getElementById('sales-level-up-button');
    salesLevelUpButton.addEventListener('mousedown', function () {
      AppStore.incrementSalesLevel();
      needsUiUpdate = true;
    });

    var decreaseWorkstationPriceButton = document.getElementById('decrease-workstation-price');
    decreaseWorkstationPriceButton.addEventListener('mousedown', function () {
      AppStore.decrementWorkstationPrice();
      needsUiUpdate = true;
    });

    var increaseWorkstationPriceButton = document.getElementById('increase-workstation-price');
    increaseWorkstationPriceButton.addEventListener('mousedown', function () {
      AppStore.incrementWorkstationPrice();
      needsUiUpdate = true;
    });

    var decreaseDensityButton = document.getElementById('decrease-density');
    decreaseDensityButton.addEventListener('mousedown', function () {
      AppStore.decrementDensity();
      needsUiUpdate = true;
    });

    var increaseDensityButton = document.getElementById('increase-density');
    increaseDensityButton.addEventListener('mousedown', function () {
      AppStore.incrementDensity();
      needsUiUpdate = true;
    });
  }

  function handleQuarterChange() {
    QuarterlyRentPayer.call();
    needsUiUpdate = true;
  }

  function handleMonthChange() {
    MonthlyLicenceFeeCollector.call();
    MonthlyBillPayer.call();
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
