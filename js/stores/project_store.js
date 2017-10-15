var ProjectStore;

(function () {
  var projects = [
    /*
    new Project({
      title: 'Marketing Strategy Consultant',
      description: 'Increase you ability to generate leads.',
      oneOffCost: 20000,
      monthlyCost: 0,
      callback: function () {
        AppStore.incrementMarketingLevel();
      }
    })
    */
  ];

  var monthlyProjectCosts = 0;

  ProjectStore = {
    addToMonthlyProjectCosts: function (cost) {
      monthlyProjectCosts += cost;

      return true;
    },

    monthlyProjectCosts: function () {
      return monthlyProjectCosts;
    },

    projects: function () {
      return projects;
    },

    removeProject: function (project) {
      projects.forEach(function (candidateProject, index) {
        if (project === candidateProject) {
          projects.splice(index, 1);
        }
      });
    }
  };
})();
