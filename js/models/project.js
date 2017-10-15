function Project(options) {
  var defaultCurrency = 'GBP';
  var description = options.description;
  var monthlyCost = options.monthlyCost;
  var oneOffCost = options.oneOffCost;
  var title = options.title;
  var callback = options.callback;

  this.currency = function () {
    return defaultCurrency;
  };

  this.decorate = function () {
    return new ProjectDecorator(this);
  };

  this.description = function () {
    return description;
  };

  this.monthlyCost = function () {
    return monthlyCost;
  };

  this.oneOffCost = function () {
    return oneOffCost;
  };

  this.run = function () {
    callback.call();
  };

  this.title = function () {
    return title;
  };
}
