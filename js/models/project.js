function Project(options) {
  var callback = options.callback;
  var conditions = options.conditions;
  var conditionsMet = options.conditionsMet;
  var defaultCurrency = 'GBP';
  var description = options.description;
  var title = options.title;

  this.conditions = function () {
    return conditions;
  };

  this.conditionsMet = function () {
    return conditionsMet.call();
  };

  this.currency = function () {
    return defaultCurrency;
  };

  this.decorate = function () {
    return new ProjectDecorator(this);
  };

  this.description = function () {
    return description;
  };

  this.run = function () {
    callback.call();
  };

  this.title = function () {
    return title;
  };
}
