var BankAccount;

(function () {
  BankAccount = function (openingBalance) {
    var balance = parseInt(openingBalance);
    var defaultCurrency = 'GBP';

    this.balance = function () {
      return parseInt(balance);
    };

    this.currency = function () {
      return defaultCurrency;
    };

    this.decorate = function () {
      return new BankAccountDecorator(this);
    };

    this.deposit = function (amount) {
      balance += parseInt(amount);

      return true;
    };

    this.isOverLimit = function () {
      return balance < this.overdraftLimit();
    };

    this.overdraftLimit = function () {
      return 0; 
    };

    this.withdraw = function (amount) {
      balance -= amount;

      return amount;
    };
  };
})();
