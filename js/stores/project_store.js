var ProjectStore;

(function () {
  // Project requirements and state tracking
  var seriesAMemberCount = 720;
  var seriesBMemberCount = 1600;
  var seriesCMemberCount = 5000;
  var seriesDMemberCount = 10000;
  
  // Track completed projects by title
  var completedProjects = {};
  
  // Store all available projects, regardless of visibility
  var allProjects = [
    new Project({
      title: 'Run Community Events',
      description: 'Launch regular events to improve member satisfaction. Costs £1,000 upfront. Set a budget per member in the Product panel.',
      conditions: 'Have at least £1,000 in the bank',
      conditionsMet: function () {
        return AppStore.bankAccount().balance() >= 1000;
      },
      callback: function () {
        AppStore.bankAccount().withdraw(1000);
        completedProjects['Run Community Events'] = true;
        
        // Set initial per-member budget to £1
        var mis = AppStore.managementInformationSystem();
        if (mis.setCommunityEventsPerMember) {
          mis.setCommunityEventsPerMember(1);
        }
        
        // Use the global permanent show function if available
        if (typeof window.showCommunityEvents === 'function') {
          console.log("Calling global showCommunityEvents from project callback");
          window.showCommunityEvents();
        } else {
          console.error("Global showCommunityEvents function not available");
          
          try {
            console.log("Showing Member Satisfaction panel and Community Events Budget");
            
            // Show the Member Satisfaction panel
            var satisfactionPanel = document.getElementById('member-satisfaction-panel');
            if (satisfactionPanel) {
              satisfactionPanel.style.display = 'block';
            } else {
              console.error("Could not find member-satisfaction-panel element");
            }
            
            // Find and directly manipulate the community events container
            var eventsContainer = document.getElementById('community-events-container');
            if (eventsContainer) {
              // Remove from feature system completely
              eventsContainer.classList.remove('feature-section');
              eventsContainer.removeAttribute('data-feature');
              // Force display
              eventsContainer.style.cssText = "display: block !important";
              console.log("Directly showing community events container");
            } else {
              // Fallback to querying all matching elements
              var communityEventsControls = document.querySelectorAll('[data-feature="communityEvents"]');
              communityEventsControls.forEach(function(element) {
                element.style.cssText = "display: block !important";
                element.classList.remove('feature-hidden');
                element.removeAttribute('data-feature');
                console.log("Fallback: showing community events control elements");
              });
            }
            
            // Make sure outer container is visible
            var eventsOuterContainer = document.getElementById('community-events-outer-container');
            if (eventsOuterContainer) {
              eventsOuterContainer.style.cssText = "display: block !important";
            }
            
            // Initialize the NPS gauge if needed
            if (typeof InterfaceRepainter !== 'undefined' && 
                typeof InterfaceRepainter.initGauges === 'function') {
              InterfaceRepainter.initGauges();
            }
            
            // Update ProgressionStore for visibility
            if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
              ProgressionStore.features.npsGauge.visible = true;
              ProgressionStore.features.communityEvents.visible = true;
              
              // Update tracked features in InterfaceRepainter
              if (typeof InterfaceRepainter !== 'undefined' && 
                  typeof InterfaceRepainter.featuresShown !== 'undefined') {
                InterfaceRepainter.featuresShown.communityEvents = true;
              }
            }
          } catch (error) {
            console.error("Error showing Community Events features:", error);
          }
        }
        
        // Set global flag for consistent state
        window.COMMUNITY_EVENTS_RUNNING = true;
        
        // Force UI update immediately
        needsUiUpdate = true;
        if (typeof InterfaceRepainter !== 'undefined') {
          InterfaceRepainter.updateFeatureVisibility();
          InterfaceRepainter.call();
        }
        
        Logger.log("You've started a community events program! Member satisfaction has improved. You can now see the Member Satisfaction panel and set a per-member monthly budget in the Product panel.");
        
        // Show a toast notification to call attention to the new panel
        setTimeout(function() {
          // Double-check the panel is visible
          var panel = document.getElementById('member-satisfaction-panel');
          if (panel && panel.style.display !== 'block') {
            panel.style.display = 'block';
          }
          
          try {
            var toast = document.getElementById('event-notification');
            var toastTitle = document.getElementById('event-title');
            var toastDesc = document.getElementById('event-description');
            var toastIcon = document.getElementById('event-icon');
            
            if (toast && toastTitle && toastDesc) {
              toastTitle.textContent = "New Feature Unlocked!";
              toastIcon.className = "bi bi-award-fill me-2";
              toastDesc.textContent = "You've unlocked the Member Satisfaction panel and Community Events Budget! Set your monthly community events budget in the Product panel.";
              
              // Show the toast
              var bsToast = new bootstrap.Toast(toast);
              bsToast.show();
            }
          } catch (err) {
            console.error("Error showing toast notification:", err);
          }
        }, 500);
      }
    }),
    
    new Project({
      title: 'Hire Sales Manager',
      description: 'Hire a professional Sales Manager to improve your sales team efficiency. Costs £5,000 upfront plus £60,000/year in salary.',
      conditions: 'Have at least £5,000 in the bank',
      conditionsMet: function () {
        return AppStore.bankAccount().balance() >= 5000;
      },
      callback: function () {
        AppStore.bankAccount().withdraw(5000);
        completedProjects['Hire Sales Manager'] = true;
        
        // Staff functionality disabled for now
        /*
        // Create staff member in the StaffStore
        if (typeof StaffStore !== 'undefined' && StaffStore.createStaffFromProject) {
          var staffMember = StaffStore.createStaffFromProject('Hire Sales Manager');
          if (staffMember) {
            console.log("Created Sales Manager staff member: ", staffMember.name());
          }
        }
        */
        
        // Use the global permanent show function if available
        if (typeof window.showSalesControls === 'function') {
          console.log("Calling global showSalesControls from project callback");
          window.showSalesControls();
        } else {
          console.error("Global showSalesControls function not available");
          
          // Fallback approach
          if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
            ProgressionStore.features.salesControls.visible = true;
          }
          
          try {
            // Find and show the sales controls container
            var salesContainer = document.getElementById('sales-controls-container');
            if (salesContainer) {
              salesContainer.style.cssText = "display: block !important";
              salesContainer.classList.remove('feature-section');
              salesContainer.removeAttribute('data-feature');
            }
            
            // Make sure outer container is visible
            var salesOuterContainer = document.getElementById('sales-outer-container');
            if (salesOuterContainer) {
              salesOuterContainer.style.cssText = "display: block !important";
            }
          } catch (error) {
            console.error("Error showing sales controls:", error);
          }
        }
        
        // Force UI update with max priority
        needsUiUpdate = true;
        if (typeof InterfaceRepainter !== 'undefined') {
          InterfaceRepainter.updateFeatureVisibility();
          InterfaceRepainter.call();
        }
        
        /* Staff functionality disabled
        // Force UI refresh for staff panel
        if (typeof StaffDecorator !== 'undefined') {
          setTimeout(function() {
            StaffDecorator.renderStaffManagement();
          }, 100);
        }
        */
        
        Logger.log("You've hired a Sales Manager! You can now invest in your sales team. This adds £5,000 per month in ongoing costs.");
        
        // Set a global flag for persistence across refreshes
        window.SALES_MANAGER_HIRED = true;
      }
    }),
    
    new Project({
      title: 'Hire Marketing Manager',
      description: 'Hire a professional Marketing Manager to improve your lead generation. Costs £5,000 upfront plus £60,000/year in salary.',
      conditions: 'Have at least £5,000 in the bank',
      conditionsMet: function () {
        return AppStore.bankAccount().balance() >= 5000;
      },
      callback: function () {
        AppStore.bankAccount().withdraw(5000);
        completedProjects['Hire Marketing Manager'] = true;
        
        // Create staff member in the StaffStore
        if (typeof StaffStore !== 'undefined' && StaffStore.createStaffFromProject) {
          var staffMember = StaffStore.createStaffFromProject('Hire Marketing Manager');
          if (staffMember) {
            console.log("Created Marketing Manager staff member: ", staffMember.name());
          }
        }
        
        // Use the global permanent show function if available
        if (typeof window.showMarketingControls === 'function') {
          console.log("Calling global showMarketingControls from project callback");
          window.showMarketingControls();
        } else {
          console.error("Global showMarketingControls function not available");
          
          // Fallback approach
          if (typeof ProgressionStore !== 'undefined' && ProgressionStore.features) {
            ProgressionStore.features.marketingControls.visible = true;
          }
          
          try {
            // Find and show the marketing controls container
            var marketingContainer = document.getElementById('marketing-controls-container');
            if (marketingContainer) {
              marketingContainer.style.cssText = "display: block !important";
              marketingContainer.classList.remove('feature-section');
              marketingContainer.removeAttribute('data-feature');
            }
            
            // Make sure outer container is visible
            var marketingOuterContainer = document.getElementById('marketing-outer-container');
            if (marketingOuterContainer) {
              marketingOuterContainer.style.cssText = "display: block !important";
            }
          } catch (error) {
            console.error("Error showing marketing controls:", error);
          }
        }
        
        // Force UI update with max priority
        needsUiUpdate = true;
        if (typeof InterfaceRepainter !== 'undefined') {
          InterfaceRepainter.updateFeatureVisibility();
          InterfaceRepainter.call();
        }
        
        // Force UI refresh for staff panel
        if (typeof StaffDecorator !== 'undefined') {
          setTimeout(function() {
            StaffDecorator.renderStaffManagement();
          }, 100);
        }
        
        Logger.log("You've hired a Marketing Manager! You can now invest in your marketing team. This adds £5,000 per month in ongoing costs.");
        
        // Set a global flag for persistence across refreshes
        window.MARKETING_MANAGER_HIRED = true;
      }
    }),
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
        completedProjects['Raise Series A'] = true;
      }
    }),
    new Project({
      title: 'Raise Series B',
      description: 'Injection of £10m for growth.',
      conditions: Util.numberWithCommas(seriesBMemberCount) + ' members',
      conditionsMet: function () {
        return (
          completedProjects['Raise Series A'] &&
          AppStore.managementInformationSystem().memberUserCount() >= seriesBMemberCount
        );
      },
      callback: function () {
        AppStore.bankAccount().deposit(10000000);
        completedProjects['Raise Series B'] = true;
      }
    }),
    new Project({
      title: 'Raise Series C',
      description: 'Injection of £20m for growth.',
      conditions: Util.numberWithCommas(seriesCMemberCount) + ' members',
      conditionsMet: function () {
        return (
          completedProjects['Raise Series B'] &&
          AppStore.managementInformationSystem().memberUserCount() >= seriesCMemberCount
        );
      },
      callback: function () {
        AppStore.bankAccount().deposit(20000000);
        completedProjects['Raise Series C'] = true;
      }
    }),
    new Project({
      title: 'Raise Series D',
      description: 'Injection of £40m for growth.',
      conditions: Util.numberWithCommas(seriesDMemberCount) + ' members',
      conditionsMet: function () {
        return (
          completedProjects['Raise Series C'] &&
          AppStore.managementInformationSystem().memberUserCount() >= seriesDMemberCount
        );
      },
      callback: function () {
        AppStore.bankAccount().deposit(40000000);
        completedProjects['Raise Series D'] = true;
      }
    }),
    /* Office Manager disabled with Staff functionality
    new Project({
      title: 'Hire Office Manager',
      description: 'Reduce member churn rate and improve member satisfaction. Costs £5,000 upfront plus £50,000 per year in ongoing costs.',
      conditions: '50 members and £5,000',
      conditionsMet: function () {
        return (
          AppStore.managementInformationSystem().memberUserCount() >= 50 &&
          AppStore.bankAccount().balance() >= 5000
        );
      },
      callback: function () {
        AppStore.bankAccount().withdraw(5000);
        completedProjects['Hire Office Manager'] = true;
        
        // Create staff member in the StaffStore
        if (typeof StaffStore !== 'undefined' && StaffStore.createStaffFromProject) {
          var staffMember = StaffStore.createStaffFromProject('Hire Office Manager');
          if (staffMember) {
            console.log("Created Office Manager staff member: ", staffMember.name());
          }
        }
        
        Logger.log("You've hired an Office Manager! Member churn rate is reduced and satisfaction is improved. This adds £4,167 in monthly costs.");
        
        // Force UI refresh for staff panel
        if (typeof StaffDecorator !== 'undefined') {
          setTimeout(function() {
            StaffDecorator.renderStaffManagement();
          }, 100);
        }
      }
    }),
    */
    new Project({
      title: 'Improve Amenities',
      description: 'Increase member satisfaction and willingness to pay higher prices.',
      conditions: 'Have at least £100,000 in the bank',
      conditionsMet: function () {
        return AppStore.bankAccount().balance() >= 100000;
      },
      callback: function () {
        AppStore.bankAccount().withdraw(100000);
        // Allow for higher workstation pricing
        completedProjects['Improve Amenities'] = true;
        Logger.log("You've upgraded the amenities! Members are willing to pay more for their workspace.");
      }
    }),
    /* Staff functionality disabled for now
    new Project({
      title: 'Hiring Plan',
      description: 'Create a system to hire, manage, and develop your staff. Costs £5,000 upfront. Will allow hiring specialised staff with various benefits.',
      conditions: 'Have at least £5,000 in the bank and 50+ members',
      conditionsMet: function () {
        return AppStore.bankAccount().balance() >= 5000 && 
               AppStore.managementInformationSystem().memberUserCount() >= 50;
      },
      callback: function () {
        AppStore.bankAccount().withdraw(5000);
        completedProjects['Hiring Plan'] = true;
        
        // Use the global function to unlock staff management if available
        if (typeof window.unlockStaffManagement === 'function') {
          console.log("Calling global unlockStaffManagement from project callback");
          window.unlockStaffManagement();
        } else {
          console.error("Global unlockStaffManagement function not available");
          
          // Fallback: try to show the staff management panel directly
          try {
            console.log("Showing Staff Management panel directly");
            var staffPanel = document.querySelector('.card[data-feature="staffManagement"]');
            if (staffPanel) {
              staffPanel.classList.remove('feature-section');
              staffPanel.removeAttribute('data-feature');
              staffPanel.style.display = 'block';
            } else {
              console.error("Could not find staff management panel element");
            }
          } catch (err) {
            console.error("Error showing staff management panel:", err);
          }
        }
        
        // Initialize StaffStore if available
        if (typeof StaffStore !== 'undefined' && StaffStore.init) {
          StaffStore.init();
        }
        
        Logger.log('Hiring Plan ready! You can now hire and manage staff.');
      }
    })
    */
  ];

  // Public API
  ProjectStore = {
    // Get visible projects based on progression - limited to maximum of 3
    projects: function () {
      // If ProgressionStore is available, filter by visible projects
      if (typeof ProgressionStore !== 'undefined') {
        var visibleProjectTitles = ProgressionStore.getVisibleProjects();
        
        // Add staff-related projects only if Hiring Plan is completed
        var staffProjects = ["Hire Office Manager", "Hire Sales Manager", "Hire Marketing Manager"];
        var hiringPlanCompleted = completedProjects['Hiring Plan'];
        
        // Filter projects to only include those in the visible list
        var eligibleProjects = allProjects.filter(function(project) {
          var title = project.title();
          // Check if it's a staff project that requires Hiring Plan
          var isStaffProject = staffProjects.indexOf(title) !== -1;
          
          // Special handling for staff projects
          if (isStaffProject) {
            // Only show if both in visible projects list AND Hiring Plan is completed
            return visibleProjectTitles.indexOf(title) !== -1 && 
                   !completedProjects[title] &&
                   hiringPlanCompleted;
          } else {
            // Normal handling for non-staff projects
            return visibleProjectTitles.indexOf(title) !== -1 && 
                   !completedProjects[title];
          }
        });
        
        // Sort by priority - ensure fixed order with Community Events first, then Hiring Plan
        eligibleProjects.sort(function(a, b) {
          // Fixed order for important projects
          const projectOrder = {
            "Run Community Events": 1,
            "Hiring Plan": 2,
            "Improve Amenities": 3
          };
          
          const orderA = projectOrder[a.title()] || 999;
          const orderB = projectOrder[b.title()] || 999;
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          // For staff projects, prioritize Office Manager
          if (staffProjects.indexOf(a.title()) !== -1 && staffProjects.indexOf(b.title()) !== -1) {
            if (a.title() === "Hire Office Manager") return -1;
            if (b.title() === "Hire Office Manager") return 1;
          }
          
          return 0; // Default order
        });
        
        // Limit to maximum of 3 projects
        return eligibleProjects.slice(0, 3);
      }
      
      // Default behavior: return all active projects (except staff projects if Hiring Plan not complete)
      // Also limited to max of 3
      var staffProjects = ["Hire Office Manager", "Hire Sales Manager", "Hire Marketing Manager"];
      var hiringPlanCompleted = completedProjects['Hiring Plan'];
      
      var eligibleProjects = allProjects.filter(function(project) {
        var title = project.title();
        var isStaffProject = staffProjects.indexOf(title) !== -1;
        
        return !completedProjects[title] && 
               (!isStaffProject || hiringPlanCompleted);
      });
      
      // Sort by priority - ensure fixed order
      eligibleProjects.sort(function(a, b) {
        // Fixed order for important projects
        const projectOrder = {
          "Run Community Events": 1,
          "Hiring Plan": 2,
          "Improve Amenities": 3
        };
        
        const orderA = projectOrder[a.title()] || 999;
        const orderB = projectOrder[b.title()] || 999;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        // For staff projects, prioritize Office Manager
        if (staffProjects.indexOf(a.title()) !== -1 && staffProjects.indexOf(b.title()) !== -1) {
          if (a.title() === "Hire Office Manager") return -1;
          if (b.title() === "Hire Office Manager") return 1;
        }
        
        return 0; // Default order
      });
      
      // Limit to maximum of 3 projects
      return eligibleProjects.slice(0, 3);
    },
    
    // Get all projects, even those not visible due to progression
    getAllProjects: function() {
      return allProjects;
    },
    
    // Check if a specific project has been completed
    isProjectCompleted: function(projectTitle) {
      return !!completedProjects[projectTitle];
    },
    
    // Get a list of all completed project titles
    getCompletedProjects: function() {
      return Object.keys(completedProjects);
    },
    
    // Remove a project from the list (e.g., after completion)
    removeProject: function (project) {
      // Mark as completed
      if (project && project.title) {
        completedProjects[project.title()] = true;
      }
    },
    
    // Clear all project completion status (for testing/reset)
    resetCompletions: function() {
      completedProjects = {};
    }
  };
})();
