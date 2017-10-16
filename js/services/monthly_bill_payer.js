var MonthlyBillPayer = {
    call: function () {
      var billTotal = 0;
      var spaces = AppStore.spaces();
  
      if (spaces.length === 0) {
        return;
      }
  
      spaces.forEach(function (space) {
        billTotal += space.monthlyBillTotal();
      });

      AppStore.bankAccount().withdraw(billTotal);
    }
  };
