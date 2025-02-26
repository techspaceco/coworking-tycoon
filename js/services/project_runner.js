var ProjectRunner = {
    call: function (project) {
      // Check if the project is still valid
      if (!project || !project.title) {
        console.error("Invalid project object");
        return false;
      }
      
      console.log("Running project: " + project.title());
      
      // Double-check conditions are still met before executing
      if (!project.conditionsMet()) {
        console.log("Project conditions no longer met - can't execute");
        alert("Project conditions are no longer met. Please try again when conditions are satisfied.");
        needsUiUpdate = true;
        return false;
      }
      
      try {
        // Run the project first to make sure it completes
        project.run();
        console.log("Project completed successfully, removing from available projects");
        
        // Then remove it from the store
        ProjectStore.removeProject(project);
        
        // Log completion message
        Logger.log("Project completed: " + project.title() + "!");
        
        // Check progression to see if this unlocked new features
        if (typeof ProgressionStore !== 'undefined') {
          ProgressionStore.updateProgression();
        }
        
        // Force immediate UI update - this must happen AFTER any changes to ProgressionStore
        needsUiUpdate = true;
        
        // Special handling for projects that unlock UI elements
        if (project.title() === "Hire Sales Manager") {
          try {
            var salesControls = document.querySelectorAll('[data-feature="salesControls"]');
            salesControls.forEach(function(element) {
              element.style.display = '';
              element.classList.remove('feature-hidden');
              console.log("ProjectRunner: Showing sales controls");
            });
            
            if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
              ProgressionStore.features.salesControls.visible = true;
            }
          } catch (error) {
            console.error("Error showing sales controls:", error);
          }
        } else if (project.title() === "Hire Marketing Manager") {
          try {
            var marketingControls = document.querySelectorAll('[data-feature="marketingControls"]');
            marketingControls.forEach(function(element) {
              element.style.display = '';
              element.classList.remove('feature-hidden');
              console.log("ProjectRunner: Showing marketing controls");
            });
            
            if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
              ProgressionStore.features.marketingControls.visible = true;
            }
          } catch (error) {
            console.error("Error showing marketing controls:", error);
          }
        } else if (project.title() === "Run Community Events") {
          try {
            // Show the Member Satisfaction panel
            var satisfactionPanel = document.getElementById('member-satisfaction-panel');
            if (satisfactionPanel) {
              satisfactionPanel.style.display = 'block';
            }
            
            // Show Community Events Budget in Product panel
            var communityEventsControls = document.querySelectorAll('[data-feature="communityEvents"]');
            communityEventsControls.forEach(function(element) {
              element.style.display = '';
              element.classList.remove('feature-hidden');
              console.log("ProjectRunner: Showing Community Events Budget");
            });
            
            if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
              ProgressionStore.features.npsGauge.visible = true;
              ProgressionStore.features.communityEvents.visible = true;
            }
          } catch (error) {
            console.error("Error showing community events features:", error);
          }
        }
        
        // We need to manually call updateFeatureVisibility if project completion changed feature visibility
        if (typeof InterfaceRepainter !== 'undefined' && 
            typeof InterfaceRepainter.updateFeatureVisibility === 'function') {
          InterfaceRepainter.updateFeatureVisibility();
        }
        
        // Then do a full UI update
        InterfaceRepainter.call();
        
        // SPECIAL HANDLING for projects that need permanent visibility
        if (project.title() === 'Run Community Events') {
          // Use the global window function for maximum reliability - but don't create a separate timer
          // Execute synchronously to avoid duplicate popups
          try {
            console.log("ProjectRunner: Permanently showing Community Events Budget");
            if (typeof window.showCommunityEvents === 'function') {
              window.showCommunityEvents();
            } else {
              // Fallback approach if global function not available
              var eventsContainer = document.getElementById('community-events-container');
              if (eventsContainer) {
                // Remove from feature system completely
                eventsContainer.classList.remove('feature-section');
                eventsContainer.removeAttribute('data-feature');
                // Force display permanently
                eventsContainer.style.cssText = "display: block !important";
              }
              
              // Ensure outer container is visible
              var eventsOuterContainer = document.getElementById('community-events-outer-container');
              if (eventsOuterContainer) {
                eventsOuterContainer.style.cssText = "display: block !important";
              }
              
              // Set global flag
              window.COMMUNITY_EVENTS_RUNNING = true;
              
              // Update ProgressionStore if available
              if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
                ProgressionStore.features.communityEvents.visible = true;
              }
            }
            
            // Final UI update
            if (typeof InterfaceRepainter !== 'undefined') {
              InterfaceRepainter.call();
            }
          } catch (err) {
            console.error("ProjectRunner: Error showing community events budget:", err);
          }
        }
        
        // Manager projects visibility handling
        if (project.title() === 'Hire Sales Manager') {
          // Use the global window function for maximum reliability - synchronously
          try {
            console.log("ProjectRunner: Permanently showing Sales controls");
            if (typeof window.showSalesControls === 'function') {
              window.showSalesControls();
            } else {
              // Fallback approach if global function not available
              var salesContainer = document.getElementById('sales-controls-container');
              if (salesContainer) {
                // Remove from feature system completely
                salesContainer.classList.remove('feature-section');
                salesContainer.removeAttribute('data-feature');
                // Force display permanently
                salesContainer.style.cssText = "display: block !important";
              }
              
              // Ensure outer container is visible
              var salesOuterContainer = document.getElementById('sales-outer-container');
              if (salesOuterContainer) {
                salesOuterContainer.style.cssText = "display: block !important";
              }
              
              // Set global flag
              window.SALES_MANAGER_HIRED = true;
              
              // Update ProgressionStore if available
              if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
                ProgressionStore.features.salesControls.visible = true;
              }
            }
            
            // Final UI update
            if (typeof InterfaceRepainter !== 'undefined') {
              InterfaceRepainter.call();
            }
          } catch (err) {
            console.error("ProjectRunner: Error showing sales controls:", err);
          }
        }
        
        if (project.title() === 'Hire Marketing Manager') {
          // Use the global window function for maximum reliability - synchronously
          try {
            console.log("ProjectRunner: Permanently showing Marketing controls");
            if (typeof window.showMarketingControls === 'function') {
              window.showMarketingControls();
            } else {
              // Fallback approach if global function not available
              var marketingContainer = document.getElementById('marketing-controls-container');
              if (marketingContainer) {
                // Remove from feature system completely
                marketingContainer.classList.remove('feature-section');
                marketingContainer.removeAttribute('data-feature');
                // Force display permanently
                marketingContainer.style.cssText = "display: block !important";
              }
              
              // Ensure outer container is visible
              var marketingOuterContainer = document.getElementById('marketing-outer-container');
              if (marketingOuterContainer) {
                marketingOuterContainer.style.cssText = "display: block !important";
              }
              
              // Set global flag
              window.MARKETING_MANAGER_HIRED = true;
              
              // Update ProgressionStore if available
              if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
                ProgressionStore.features.marketingControls.visible = true;
              }
            }
            
            // Final UI update
            if (typeof InterfaceRepainter !== 'undefined') {
              InterfaceRepainter.call();
            }
          } catch (err) {
            console.error("ProjectRunner: Error showing marketing controls:", err);
          }
        }
        
        // Alert the user with appropriate message
        var alertMessage;
        if (project.title().indexOf('Raise Series') === 0) {
          alertMessage = "Successfully raised funding: " + project.title();
        } else {
          alertMessage = "Project completed: " + project.title();
        }
        
        setTimeout(function() {
          alert(alertMessage);
        }, 50);
        
        return true;
      } catch (error) {
        console.error("Error running project:", error);
        return false;
      }
    }
  };
  