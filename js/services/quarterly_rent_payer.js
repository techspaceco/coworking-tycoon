var QuarterlyRentPayer = {
  call: function () {
    var rent = 0;
    var spaces = AppStore.spaces();

    if (spaces.length === 0) {
      return;
    }

    spaces.forEach(function (space) {
      rent += space.quarterlyRent();
    });

    AppStore.bankAccount().withdraw(rent);
  }
};
