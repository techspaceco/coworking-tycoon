var ProjectStore;

(function () {
  var seriesAMemberCount = 720;
  var seriesBMemberCount = 1600;
  var seriesCMemberCount = 5000;
  var seriesDMemberCount = 10000;
  var seriesAComplete = false;
  var seriesBComplete = false;
  var seriesCComplete = false;

  var projects = [
    new Project({
      title: 'Raise Series A',
      description: 'Injection of £5m for growth.',
      conditions: Util.numberWithCommas(seriesAMemberCount) + ' members',
      conditionsMet: function () {
        var currentMembers = AppStore.managementInformationSystem().memberUserCount();
        var conditionMet = currentMembers >= seriesAMemberCount;
        console.log("Series A condition check: " + currentMembers + " >= " + seriesAMemberCount + " = " + conditionMet);
        return conditionMet;
      },
      callback: function () {
        AppStore.bankAccount().deposit(5000000);
        seriesAComplete = true;
      }
    }),
    new Project({
      title: 'Raise Series B',
      description: 'Injection of £10m for growth.',
      conditions: Util.numberWithCommas(seriesBMemberCount) + ' members',
      conditionsMet: function () {
        return (
          seriesAComplete &&
          AppStore.managementInformationSystem().memberUserCount() >= seriesBMemberCount
        );
      },
      callback: function () {
        AppStore.bankAccount().deposit(10000000);
        seriesBComplete = true;
      }
    }),
    new Project({
      title: 'Raise Series C',
      description: 'Injection of £20m for growth.',
      conditions: Util.numberWithCommas(seriesCMemberCount) + ' members',
      conditionsMet: function () {
        return (
          seriesBComplete &&
          AppStore.managementInformationSystem().memberUserCount() >= seriesCMemberCount
        );
      },
      callback: function () {
        AppStore.bankAccount().deposit(20000000);
        seriesCComplete = true;
      }
    }),
    new Project({
      title: 'Raise Series D',
      description: 'Injection of £40m for growth.',
      conditions: Util.numberWithCommas(seriesDMemberCount) + ' members',
      conditionsMet: function () {
        return (
          seriesCComplete &&
          AppStore.managementInformationSystem().memberUserCount() >= seriesDMemberCount
        );
      },
      callback: function () {
        AppStore.bankAccount().deposit(40000000);
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
