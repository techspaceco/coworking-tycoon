var ManagementInformationSystemDecorator;

(function () {
  ManagementInformationSystemDecorator = function (mis) {
    this.monthlyBusinessRatesCost = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.monthlyBusinessRatesCost())
      );
    };

    this.businessRatesRate = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.businessRatesRate()) +
        ' per sq ft'
      );
    };

    this.density = function () {
      return Util.numberWithCommas(mis.density()) + ' sq ft per workstation';
    };

    this.foreCastCashLow = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.foreCastCashLow())
      );
    };

    this.marketingLevelUpCost = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.marketingLevelUpCost())
      );
    };

    this.monthlyRevenue = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.monthlyRevenue()) +
        ' per month'
      );
    };

    this.monthlyChurnRate = function () {
      return Util.numberWithCommas(
        parseInt(mis.monthlyChurnRate() * 100) + '%'
      );
    };

    this.monthlyLeadVolume = function () {
      return Util.numberWithCommas(
        mis.monthlyLeadVolume() + ' workstations per month'
      );
    };

    this.monthlyOverheads = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.monthlyOverheads()) +
        ' per month'
      );
    };

    this.monthlySalesVolume = function () {
      return Util.numberWithCommas(
        mis.monthlySalesVolume() + ' workstations per month'
      );
    };

    this.grossMargin = function () {
      return parseInt(mis.grossMargin() * 100) + '%';
    }

    this.occupancy = function () {
      return parseInt(mis.occupancy() * 100) + '%';
    };

    this.quarterlyRentBill = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.quarterlyRentBill())
      );
    };

    this.repairsAndMaintenanceRate = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.repairsAndMaintenanceRate()) +
        ' per sq ft'
      );
    };

    this.salesLevelUpCost = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.salesLevelUpCost())
      );
    };

    this.staffRate = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.staffRate()) +
        ' per sq ft'
      );
    };

    this.totalArea = function () {
      return Util.numberWithCommas(mis.totalArea() + ' sq ft');
    };

    this.utilitiesRate = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.utilitiesRate()) +
        ' per sq ft'
      );
    };

    this.workstationPrice = function () {
      return (
        Util.htmlCurrencySymbolMap[mis.currency()] +
        Util.numberWithCommas(mis.workstationPrice()) +
        ' per month'
      );
    };

    return this;
  }
})();
