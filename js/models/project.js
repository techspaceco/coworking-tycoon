function Project(options) {
  var callback = options.callback;
  var conditions = options.conditions;
  var conditionsMet = options.conditionsMet;
  var defaultCurrency = 'GBP';
  var description = options.description;
  var title = options.title;
  var id = "project_" + title.replace(/\s+/g, "_").toLowerCase(); // Create a unique ID

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
  
  // Add ID getter
  this.id = function() {
    return id;
  };
}
