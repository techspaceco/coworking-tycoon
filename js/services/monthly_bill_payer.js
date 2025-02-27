var MonthlyBillPayer = {
    call: function () {
      var billTotal = 0;
      var spaces = AppStore.spaces();
      
      // Calculate space-related expenses
      if (spaces.length > 0) {
        spaces.forEach(function (space) {
          billTotal += space.monthlyBillTotal();
        });
      }
      
      // Add staff costs if the StaffStore exists
      if (typeof StaffStore !== 'undefined') {
        var staffCosts = StaffStore.getMonthlyStaffCost();
        billTotal += staffCosts;
        
        // Log staff costs for debugging
        if (staffCosts > 0) {
          Logger.log('Paid £' + Util.numberWithCommas(staffCosts) + ' in staff salaries.');
        }
      }
      
      // Withdraw the total amount
      if (billTotal > 0) {
        AppStore.bankAccount().withdraw(billTotal);
      }
    }
  };
