var Lease;

(function () {
  Lease = function (options) {
    var pricePerSquareFoot = options.pricePerSquareFoot;
    var area = options.area;
    var defaultCurrency = 'GBP';
    var monthsDeposit = options.monthsDeposit;

    this.area = function () {
      return area;
    };

    this.currency = function () {
      return defaultCurrency;
    };

    this.decorate = function () {
      return new LeaseDecorator(this);
    };

    this.deposit = function () {
      return parseInt(pricePerSquareFoot * area * monthsDeposit / 12);
    };

    this.monthsDeposit = function () {
      return monthsDeposit;
    };

    this.pricePerSquareFoot = function () {
      return pricePerSquareFoot;
    };

    this.quarterlyRent = function () {
      return pricePerSquareFoot * area / 4;
    };
  };
})();
