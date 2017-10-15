var LeaseDecorator;

(function () {
  LeaseDecorator = function (lease) {
    this.area = function () {
      return Util.numberWithCommas(lease.area()) + ' sq ft';
    };

    this.deposit = function () {
      return (
        Util.htmlCurrencySymbolMap[lease.currency()] +
        Util.numberWithCommas(lease.deposit()) +
        ' (' + lease.monthsDeposit() + ' months)'
      );
    };

    this.pricePerSquareFoot = function () {
      return (
        Util.htmlCurrencySymbolMap[lease.currency()] +
        Util.numberWithCommas(lease.pricePerSquareFoot()) +
        ' per sq ft'
      );
    };

    return this;
  }
})();
