var ProjectDecorator;

(function () {
  ProjectDecorator = function (project) {
    this.conditions = function () {
      return project.conditions();
    };

    this.description = function () {
      return project.description();
    };

    this.title = function () {
      return project.title();
    };

    return this;
  }
})();
