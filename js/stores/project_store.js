var ProjectStore;

(function () {
  var seriesAMemberCount = 720;

  var projects = [
    new Project({
      title: 'Raise Series A',
      description: 'Injection of £5m for growth.',
      conditions: seriesAMemberCount + ' members',
      conditionsMet: function () {
        return AppStore.managementInformationSystem().memberUserCount() > seriesAMemberCount;
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
