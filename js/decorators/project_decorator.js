var ProjectDecorator;

(function () {
  ProjectDecorator = function (project) {
    this.description = function () {
      return project.description();
    };

    this.monthlyCost = function () {
      return (
        Util.htmlCurrencySymbolMap[project.currency()] +
        Util.numberWithCommas(project.monthlyCost())
      );
    };

    this.oneOffCost = function () {
      return (
        Util.htmlCurrencySymbolMap[project.currency()] +
        Util.numberWithCommas(project.oneOffCost())
      );
    };

    this.title = function () {
      return project.title();
    };

    return this;
  }
})();
