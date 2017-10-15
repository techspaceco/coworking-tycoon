var ProjectRunner = {
    call: function (project) {
      ProjectStore.removeProject(project);
      ProjectStore.addToMonthlyProjectCosts(project.monthlyCost());

      AppStore.bankAccount().withdraw(project.oneOffCost());

      project.run();
    }
  };
  