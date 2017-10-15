var LeaseDeal;

(function () {
  var idIncrement = 0;

  LeaseDeal = function (options) {
    var id = idIncrement++;
    var lease = options.lease;

    this.id = function () {
      return id;
    };

    this.lease = function () {
      return lease;
    };
  };
})();
