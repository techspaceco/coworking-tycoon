var ProjectRunner = {
    call: function (project) {
      console.log("Running project: " + project.title());
      
      try {
        // Run the project first to make sure it completes
        project.run();
        console.log("Project completed successfully, removing from available projects");
        
        // Then remove it from the store
        ProjectStore.removeProject(project);
        
        // Force immediate UI update
        needsUiUpdate = true;
        InterfaceRepainter.call();
        
        // Alert the user
        alert("Successfully raised funding: " + project.title());
      } catch (error) {
        console.error("Error running project:", error);
      }
    }
  };
  