var DailyChurn = {
    call: function () {
      var spaces = AppStore.spaces();
  
      if (spaces.length === 0) {
        return;
      }
  
      spaces.forEach(function (space) {
        space.memberCompanies().forEach(function (company) {
          if (company.wantsToLeave()) {
            space.offboard(company);
            AppStore.managementInformationSystem().clearOccupancyCache(); // TODO: Flux pattern
          }
        });
      });
    }
  };
