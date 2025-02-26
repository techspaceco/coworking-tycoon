// Define needsUiUpdate globally so all modules can access it
var needsUiUpdate = true;

(function () {
  var date = AppStore.date();
  var currentQuarter = Util.getQuarter(date);
  var currentMonth = date.getMonth();
  var gameInterval = null;
  var uiInterval;
  var gameSpeed = 100; // ms between game ticks
  var uiRefreshRate = 200; // ms between UI updates
  var gameStarted = false; // Track if the game clock has started
  
  // Global toast configuration
  window.toastDuration = 8000; // 8 seconds duration (was typically 5s default)
  
  // Function to show and handle the welcome overlay
  function showWelcomeOverlay() {
    // Get overlay element
    var overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;
    
    // Check if there are already spaces (on page reload)
    if (AppStore.spaces().length > 0) {
      // Skip showing the overlay if already have spaces
      return;
    }
    
    // Make overlay visible with animation
    setTimeout(function() {
      overlay.classList.add('visible');
    }, 500); // Small delay for better visual effect after page load
    
    // Add event listener to close button
    var closeBtn = document.getElementById('welcome-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        // Hide the overlay with animation
        overlay.classList.remove('visible');
        // Remove completely after animation completes
        setTimeout(function() {
          overlay.style.display = 'none';
        }, 500);
      });
    }
  }
  
  // Global helper function to show toasts with consistent configuration
  window.showToast = function(title, message, iconClass, autohide = true) {
    try {
      var toast = document.getElementById('event-notification');
      var toastTitle = document.getElementById('event-title');
      var toastDesc = document.getElementById('event-description');
      var toastIcon = document.getElementById('event-icon');
      
      if (toast && toastTitle && toastDesc) {
        toastTitle.textContent = title;
        toastDesc.textContent = message;
        toastIcon.className = iconClass || "bi bi-info-circle-fill me-2";
        
        // Create toast with longer duration
        var bsToast = new bootstrap.Toast(toast, { 
          autohide: autohide,
          delay: window.toastDuration 
        });
        bsToast.show();
        
        return bsToast; // Return toast instance in case caller needs it
      }
    } catch (err) {
      console.error("Error showing toast notification:", err);
    }
    return null;
  };

  function init() {
    // Show welcome overlay instead of toast
    showWelcomeOverlay();
    
    // Initialize progression if available
    if (typeof ProgressionStore !== 'undefined') {
      ProgressionStore.init();
    }

    // Helper function to add both mouse and touch events
    function addButtonEvents(button, action) {
      // For desktop
      button.addEventListener('mousedown', function(e) {
        action();
        needsUiUpdate = true;
        
        // Unlock events after user interaction
        if (typeof EventStore !== 'undefined') {
          EventStore.unlockEvents();
        }
      });
      
      // For mobile
      button.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent double events
        button.style.opacity = '0.8'; // Visual feedback
      });
      
      button.addEventListener('touchend', function(e) {
        e.preventDefault(); // Prevent double events
        button.style.opacity = '1'; // Restore opacity
        action();
        needsUiUpdate = true;
        
        // Unlock events after user interaction
        if (typeof EventStore !== 'undefined') {
          EventStore.unlockEvents();
        }
      });
    }

    var marketingLevelUpButton = document.getElementById('marketing-level-up-button');
    addButtonEvents(marketingLevelUpButton, function() {
      AppStore.incrementMarketingLevel();
    });

    var salesLevelUpButton = document.getElementById('sales-level-up-button');
    addButtonEvents(salesLevelUpButton, function() {
      AppStore.incrementSalesLevel();
    });

    var decreaseWorkstationPriceButton = document.getElementById('decrease-workstation-price');
    addButtonEvents(decreaseWorkstationPriceButton, function() {
      AppStore.decrementWorkstationPrice();
      // Update NPS when price changes
      var mis = AppStore.managementInformationSystem();
      if (mis.calculateNps) {
        setTimeout(function() { mis.calculateNps(); }, 10);
      }
    });

    var increaseWorkstationPriceButton = document.getElementById('increase-workstation-price');
    addButtonEvents(increaseWorkstationPriceButton, function() {
      AppStore.incrementWorkstationPrice();
      // Update NPS when price changes
      var mis = AppStore.managementInformationSystem();
      if (mis.calculateNps) {
        setTimeout(function() { mis.calculateNps(); }, 10);
      }
    });

    var decreaseDensityButton = document.getElementById('decrease-density');
    addButtonEvents(decreaseDensityButton, function() {
      AppStore.decrementDensity();
      // Update NPS when density changes
      var mis = AppStore.managementInformationSystem();
      if (mis.calculateNps) {
        setTimeout(function() { mis.calculateNps(); }, 10);
      }
    });

    var increaseDensityButton = document.getElementById('increase-density');
    addButtonEvents(increaseDensityButton, function() {
      AppStore.incrementDensity();
      // Update NPS when density changes
      var mis = AppStore.managementInformationSystem();
      if (mis.calculateNps) {
        setTimeout(function() { mis.calculateNps(); }, 10);
      }
    });
    
    // Community events budget controls
    var decreaseEventsBudgetButton = document.getElementById('decrease-events-budget');
    addButtonEvents(decreaseEventsBudgetButton, function() {
      var mis = AppStore.managementInformationSystem();
      if (mis.decrementCommunityEventsPerMember) {
        mis.decrementCommunityEventsPerMember();
        // Update NPS when events budget changes
        if (mis.calculateNps) {
          setTimeout(function() { mis.calculateNps(); }, 10);
        }
      }
    });
    
    var increaseEventsBudgetButton = document.getElementById('increase-events-budget');
    addButtonEvents(increaseEventsBudgetButton, function() {
      var mis = AppStore.managementInformationSystem();
      if (mis.incrementCommunityEventsPerMember) {
        mis.incrementCommunityEventsPerMember();
        // Update NPS when events budget changes
        if (mis.calculateNps) {
          setTimeout(function() { mis.calculateNps(); }, 10);
        }
      }
    });
  }

  function handleQuarterChange() {
    QuarterlyRentPayer.call();
    
    // Check for quarterly events
    if (typeof EventStore !== 'undefined') {
      EventStore.checkForQuarterlyEvent();
    }
    
    needsUiUpdate = true;
  }

  function handleMonthChange() {
    MonthlyLicenceFeeCollector.call();
    MonthlyBillPayer.call();
    
    // Check for monthly events
    if (typeof EventStore !== 'undefined') {
      EventStore.checkForMonthlyEvent();
    }
    
    // Record financial data for charting at each month
    AppStore.managementInformationSystem().recordFinancialData();
    
    needsUiUpdate = true;
  }

  // Counter for periodic NPS updates
  var daysSinceNpsUpdate = 0;
  
  function handleDayChange() {
    var mis = AppStore.managementInformationSystem();
    
    // Check for random events
    if (typeof EventStore !== 'undefined') {
      EventStore.checkForDailyEvent();
    }
    
    DailyChurn.call();
    mis.recalculateMonthlyChurn();
    
    // Calculate NPS score periodically rather than every day
    // This makes changes more noticeable to the player
    daysSinceNpsUpdate++;
    if (daysSinceNpsUpdate >= 1) { // Calculate NPS every day for more responsiveness
      // Recalculate NPS if the method exists
      if (mis.calculateNps) {
        console.log("Performing scheduled NPS update");
        mis.calculateNps();
        
        // Force UI update after NPS calculation
        needsUiUpdate = true;
      }
      daysSinceNpsUpdate = 0;
    }
    
    // Check staff training completions
    if (typeof StaffStore !== 'undefined' && typeof StaffStore.checkTrainingCompletions === 'function') {
      var completedTrainings = StaffStore.checkTrainingCompletions();
      if (completedTrainings.length > 0) {
        console.log("Staff training completed:", completedTrainings);
        needsUiUpdate = true;
        
        // Show notification for completed training
        if (completedTrainings.length > 0) {
          var staff = completedTrainings[0]; // Just show for the first one if multiple
          window.showToast(
            "Training Complete",
            staff.name + " has completed their training.",
            "bi bi-mortarboard-fill me-2"
          );
        }
      }
    }
    
    // Check progression criteria
    if (typeof ProgressionStore !== 'undefined') {
      if (ProgressionStore.updateProgression()) {
        // If progression changed, we need to update UI
        needsUiUpdate = true;
      }
    }
    
    needsUiUpdate = true;
  }

  function updateUI() {
    if (needsUiUpdate && typeof InterfaceRepainter !== 'undefined') {
      InterfaceRepainter.call();
      needsUiUpdate = false;
    }
  }

  // Keep track of days for real estate market refresh
  var daysSinceMarketRefresh = 0;
  
  function gameLoop() {
    Util.addDay(date);
    
    // Even if no spaces, we want to update the UI to show real estate deals
    needsUiUpdate = true;

    if (AppStore.bankAccount().isOverLimit()) {
      Logger.log('You went bust!');
      clearInterval(gameInterval);
      clearInterval(uiInterval);
      
      // Display game over toast notification
      try {
        var toast = document.getElementById('event-notification');
        var toastTitle = document.getElementById('event-title');
        var toastDesc = document.getElementById('event-description');
        var toastIcon = document.getElementById('event-icon');
        
        if (toast && toastTitle && toastDesc) {
          // Set the title and icon
          toastTitle.textContent = "GAME OVER";
          toastIcon.className = "bi bi-x-circle-fill me-2";
          
          // Create a div for the description and restart button
          var gameOverContent = document.createElement('div');
          gameOverContent.innerHTML = `
            <p>You went bust! Your bank account went over the limit.</p>
            <button id="restart-game-button" class="btn btn-primary mt-2">
              <i class="bi bi-arrow-repeat me-2"></i>Restart Game
            </button>
          `;
          
          // Clear and append
          toastDesc.innerHTML = '';
          toastDesc.appendChild(gameOverContent);
          
          // Add event listener to restart button
          var restartButton = document.getElementById('restart-game-button');
          if (restartButton) {
            restartButton.addEventListener('click', function() {
              console.log("Restarting game...");
              window.location.reload();
            });
          }
          
          // Show the toast with no auto-hide
          var bsToast = new bootstrap.Toast(toast, { autohide: false });
          bsToast.show();
        }
      } catch (err) {
        console.error("Error showing game over notification:", err);
      }
      return;
    }

    // Skip lead/sale generation if no spaces yet
    if (AppStore.spaces().length > 0) {
      SalesGenerator.call(LeadGenerator.call());
    }

    var newMonth = date.getMonth();
    if (newMonth !== currentMonth) {
      currentMonth = newMonth;
      handleMonthChange();
    }

    var newQuarter = Util.getQuarter(date);
    if (newQuarter !== currentQuarter) {
      currentQuarter = newQuarter;
      handleQuarterChange();
    }

    // Refresh real estate market periodically
    daysSinceMarketRefresh++;
    if (daysSinceMarketRefresh >= 7) { // Every week
      console.log("Weekly market refresh");
      // Force deals refresh by calling the function
      RealEstateMarketStore.deals();
      daysSinceMarketRefresh = 0;
      needsUiUpdate = true;
    }

    handleDayChange();
  }

  // Function to start the game clock
  window.startGameClock = function() {
    if (!gameStarted) {
      gameStarted = true;
      gameInterval = setInterval(gameLoop, gameSpeed);
      console.log("Game clock started!");
      window.showToast("Game Started", "Time is now passing. Good luck with your coworking empire!", "bi bi-play-fill me-2");
    }
  };
  
  // Initialize the UI, but don't start the game loop yet
  setTimeout(function() {
    init();
    
    // Check if the player already has spaces (e.g., on reload)
    if (AppStore.spaces().length > 0) {
      // Start the game clock automatically
      window.startGameClock();
    }
  }, 0);
  
  uiInterval = setInterval(updateUI, uiRefreshRate);
})();
