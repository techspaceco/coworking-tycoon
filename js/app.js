(function () {
  var date = AppStore.date();
  var currentQuarter = Util.getQuarter(date);
  var currentMonth = date.getMonth();
  var intevrval;

  function init() {
    Logger.log('Welcome to Coworking Tycoon.');

    var marketingLevelUpButton = document.getElementById('marketing-level-up-button');
    marketingLevelUpButton.addEventListener('mousedown', function () {
      AppStore.incrementMarketingLevel();
    });

    var salesLevelUpButton = document.getElementById('sales-level-up-button');
    salesLevelUpButton.addEventListener('mousedown', function () {
      AppStore.incrementSalesLevel();
    });

    var decreaseWorkstationPriceButton = document.getElementById('decrease-workstation-price');
    decreaseWorkstationPriceButton.addEventListener('mousedown', function () {
      AppStore.decrementWorkstationPrice();
    });

    var increaseWorkstationPriceButton = document.getElementById('increase-workstation-price');
    increaseWorkstationPriceButton.addEventListener('mousedown', function () {
      AppStore.incrementWorkstationPrice();
    });

    var decreaseDensityButton = document.getElementById('decrease-density');
    decreaseDensityButton.addEventListener('mousedown', function () {
      AppStore.decrementDensity();
    });

    var increaseDensityButton = document.getElementById('increase-density');
    increaseDensityButton.addEventListener('mousedown', function () {
      AppStore.incrementDensity();
    });
  }

  function handleQuarterChange() {
    QuarterlyRentPayer.call();
  }

  function handleMonthChange() {
    MonthlyLicenceFeeCollector.call();
    MonthlyBillPayer.call();
  }

  function handleDayChange() {
    var mis = AppStore.managementInformationSystem();

    DailyChurn.call();

    mis.recalculateMonthlyChurn();
  }

  function main() {
    InterfaceRepainter.call();

    if (AppStore.spaces().length === 0) {
      return;
    }

    Util.addDay(date);

    if (AppStore.bankAccount().isOverLimit()) {
      Logger.log('You went bust!');

      clearInterval(intevrval);

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
  intevrval = setInterval(main, 100);
})();
