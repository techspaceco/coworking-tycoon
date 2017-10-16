var AppStore;

(function () {
  var bankAccount = new BankAccount('35000');
  var businessRatesRate = 10;
  var date = new Date('2014-09-01');
  var defaultDensity = 57;
  var defaultWorkstationPrice = 275;
  var density = defaultDensity;
  var marketingLevel = 1;
  var mis = new ManagementInformationSystem();
  var repairsAndMaintenanceRate = 4;
  var salesLevel = 1;
  var spaces = [];
  var staffRate = 3;
  var utilitiesRate = 2;
  var workstationPrice = defaultWorkstationPrice;

  AppStore = {
    addSpace: function (space) {
      return spaces.push(space);
    },

    bankAccount: function () {
      return bankAccount;
    },

    businessRatesRate: function () {
      return businessRatesRate;
    },

    date: function () {
      return date;
    },

    decrementDensity: function () {
      density--;

      return true;
    },

    decrementWorkstationPrice: function () {
      workstationPrice--;

      return true;
    },

    defaultDensity: function () {
      return defaultDensity;
    },

    defaultWorkstationPrice: function () {
      return defaultWorkstationPrice;
    },

    density: function () {
      return density;
    },

    densityFactor: function () {
      let weighting = 10;

      return ((1 + (AppStore.defaultDensity() / AppStore.density()) ** weighting) / 2);
    },

    incrementDensity: function () {
      density++;
    },

    incrementMarketingLevel: function () {
      AppStore.bankAccount().withdraw(this.marketingLevelUpCost());

      marketingLevel++;

      return true;
    },

    incrementSalesLevel: function () {
      AppStore.bankAccount().withdraw(this.salesLevelUpCost());

      salesLevel++;

      return true;
    },

    incrementWorkstationPrice: function () {
      workstationPrice++;

      return true;
    },

    managementInformationSystem: function () {
      return mis;
    },

    marketingLevel: function () {
      return marketingLevel;
    },

    marketingLevelUpCost: function () {
      return (2 ** marketingLevel) * 500;
    },

    repairsAndMaintenanceRate: function () {
      return repairsAndMaintenanceRate;
    },

    salesLevel: function () {
      return salesLevel;
    },

    salesLevelUpCost: function () {
      return (2 ** salesLevel) * 500;
    },

    spaces: function () {
      return spaces;
    },

    staffRate: function () {
      return staffRate;
    },

    utilitiesRate: function () {
      return utilitiesRate;
    },

    workstationPrice: function () {
      return workstationPrice;
    }
  };
})();
