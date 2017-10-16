var AppStore;

(function () {
  var bankAccount = new BankAccount('35000');
  var businessRatesRate = 10;
  var date = new Date('2014-09-01');
  var density = 57;
  var marketingLevel = 1;
  var mis = new ManagementInformationSystem();
  var repairsAndMaintenanceRate = 4;
  var salesLevel = 1;
  var spaces = [];
  var staffRate = 3;
  var utilitiesRate = 2;
  var workstationPrice = 275;

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

    decrementWorkstationPrice: function () {
      workstationPrice--;
    },

    density: function () {
      return density;
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
