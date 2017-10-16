var ProjectRunner = {
    call: function (project) {
      ProjectStore.removeProject(project);

      project.run();
    }
  };
  