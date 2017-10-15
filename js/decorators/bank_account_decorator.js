var BankAccountDecorator;

(function () {
  BankAccountDecorator = function (bankAccount) {
    this.balance = function () {
      return (
        Util.htmlCurrencySymbolMap[bankAccount.currency()] +
        Util.numberWithCommas(bankAccount.balance())
      );
    };

    return this;
  }
})();
