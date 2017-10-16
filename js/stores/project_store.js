var ProjectStore;

(function () {
  var projects = [
    new Project({
      title: 'Raise Series A',
      description: 'Injection of £5m for growth',
      conditions: '100 members',
      conditionsMet: function () {
        return AppStore.managementInformationSystem().memberUserCount() > 100;
      },
      callback: function () {
        AppStore.bankAccount().deposit(5000000);
      }
    })
  ];

  ProjectStore = {
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
