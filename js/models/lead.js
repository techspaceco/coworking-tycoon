var Lead;

(function () {
  Lead = function (options) {
    var size = options.size;
    var closedOn, createdOn;
    var active = true;  // Whether this lead is active or available for reuse

    this.closedOn = function () {
      return closedOn;
    };

    this.createdOn = function () {
      return createdOn;
    };
    
    this.isActive = function() {
      return active;
    };
    
    // Reactivate a cached lead
    this.activate = function(date) {
      this.setCreatedOn(date);
      closedOn = undefined;
      active = true;
      return this;
    };
    
    // Mark a lead as inactive so it can be reused
    this.deactivate = function() {
      active = false;
      return this;
    };

    this.setClosedOn = function (date) {
      var newDate = new Date();
      newDate.setTime(date.getTime())
      closedOn = newDate;
      this.deactivate(); // Once closed, mark for potential reuse
      return true;
    };

    this.setCreatedOn = function (date) {
      var newDate = new Date();
      newDate.setTime(date.getTime())
      createdOn = newDate;
      return true;
    };

    this.size = function () {
      return size;
    };

    this.setCreatedOn(AppStore.date());
  };
})();
