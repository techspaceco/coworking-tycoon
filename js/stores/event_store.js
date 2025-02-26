var EventStore;

(function() {
  // Internal state
  var events = []; // Event definitions
  var activeEvents = []; // Currently active events
  var eventHistory = []; // Record of past events (limited to 10)
  var maxEventHistory = 10; // Maximum number of events to keep in history
  var lastEventDay = 0; // To prevent too frequent events
  var dailyEventChance = 0.004; // 0.4% chance each day (extremely reduced)
  var monthlyEventChance = 0.05; // 5% chance each month (extremely reduced) 
  var quarterlyEventChance = 0.15; // 15% chance each quarter (extremely reduced)
  var minDaysBetweenEvents = 28; // Minimum 4 weeks between random events (extremely increased)
  var eventLock = false; // Flag to ensure only one event occurs between user actions
  
  // Event definitions
  var eventDefinitions = {
    positive: [
      {
        id: 'viral_article',
        title: 'Viral Article',
        description: 'A popular tech blog wrote a glowing article about your space! Increased leads for 7 days.',
        minProgressionStage: 1, // FIRST_SPACE
        duration: 7, // days
        probability: 0.5,
        effect: function() {
          // Temporarily boost lead generation
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.increaseLeadMultiplier) {
            mis.increaseLeadMultiplier(1.5, this.duration);
            
            // Log event
            Logger.log('<span class="event-positive"><i class="bi bi-newspaper"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'local_partnership',
        title: 'Local Partnership',
        description: 'You\'ve partnered with a local business group. Lower churn for 15 days.',
        minProgressionStage: 2, // GROWING
        duration: 15, // days
        probability: 0.4,
        effect: function() {
          // Temporarily reduce churn rate
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.decreaseChurnMultiplier) {
            mis.decreaseChurnMultiplier(0.7, this.duration);
            
            // Log event
            Logger.log('<span class="event-positive"><i class="bi bi-people"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'economy_boost',
        title: 'Economic Upturn',
        description: 'The local economy is booming! More leads and lower churn for 30 days.',
        minProgressionStage: 3, // EXPANDING
        duration: 30, // days
        probability: 0.3,
        effect: function() {
          // Boost leads and reduce churn
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.increaseLeadMultiplier && mis.decreaseChurnMultiplier) {
            mis.increaseLeadMultiplier(1.3, this.duration);
            mis.decreaseChurnMultiplier(0.8, this.duration);
            
            // Log event
            Logger.log('<span class="event-positive"><i class="bi bi-graph-up-arrow"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'tech_influencer',
        title: 'Tech Influencer Visit',
        description: 'A well-known tech influencer is working from your space! Boost to NPS for 5 days.',
        minProgressionStage: 2, // GROWING
        duration: 5, // days
        probability: 0.4,
        effect: function() {
          // Temporarily boost NPS
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.boostNps) {
            mis.boostNps(10, this.duration);
            
            // Log event
            Logger.log('<span class="event-positive"><i class="bi bi-person-check"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'investor_interest',
        title: 'Investor Interest',
        description: 'A potential investor has shown interest in your coworking brand! Cash injection of £10,000.',
        minProgressionStage: 3, // EXPANDING
        duration: 0, // instant effect
        probability: 0.2,
        effect: function() {
          // Cash injection
          var bankAccount = AppStore.bankAccount();
          if (bankAccount && bankAccount.deposit) {
            bankAccount.deposit(10000);
            
            // Log event
            Logger.log('<span class="event-positive"><i class="bi bi-cash-coin"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      }
    ],
    negative: [
      {
        id: 'internet_outage',
        title: 'Internet Outage',
        description: 'Your Internet provider is experiencing issues. Increased churn for 3 days.',
        minProgressionStage: 1, // FIRST_SPACE
        duration: 3, // days
        probability: 0.5,
        effect: function() {
          // Temporarily increase churn rate
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.increaseChurnMultiplier) {
            mis.increaseChurnMultiplier(1.3, this.duration);
            
            // Log event
            Logger.log('<span class="event-negative"><i class="bi bi-wifi-off"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'building_issue',
        title: 'Building Maintenance',
        description: 'Unexpected building repairs needed. One-time cost of £5,000.',
        minProgressionStage: 2, // GROWING
        duration: 0, // instant effect
        probability: 0.4,
        effect: function() {
          // One-time cost
          var bankAccount = AppStore.bankAccount();
          if (bankAccount && bankAccount.withdraw) {
            bankAccount.withdraw(5000);
            
            // Log event
            Logger.log('<span class="event-negative"><i class="bi bi-tools"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'economic_downturn',
        title: 'Economic Downturn',
        description: 'The local economy is struggling. Fewer leads and higher churn for 30 days.',
        minProgressionStage: 3, // EXPANDING
        duration: 30, // days
        probability: 0.3,
        effect: function() {
          // Reduce leads and increase churn
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.decreaseLeadMultiplier && mis.increaseChurnMultiplier) {
            mis.decreaseLeadMultiplier(0.7, this.duration);
            mis.increaseChurnMultiplier(1.2, this.duration);
            
            // Log event
            Logger.log('<span class="event-negative"><i class="bi bi-graph-down-arrow"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'competitor_opening',
        title: 'Competitor Opening',
        description: 'A new coworking space opened nearby. Reduced leads for 15 days.',
        minProgressionStage: 2, // GROWING
        duration: 15, // days
        probability: 0.4,
        effect: function() {
          // Temporarily reduce lead generation
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.decreaseLeadMultiplier) {
            mis.decreaseLeadMultiplier(0.8, this.duration);
            
            // Log event
            Logger.log('<span class="event-negative"><i class="bi bi-building"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'utility_price_hike',
        title: 'Utility Price Hike',
        description: 'Energy prices have increased. Higher overheads for 60 days.',
        minProgressionStage: 1, // FIRST_SPACE
        duration: 60, // days
        probability: 0.3,
        effect: function() {
          // Increase overhead costs
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.increaseOverheadMultiplier) {
            mis.increaseOverheadMultiplier(1.15, this.duration);
            
            // Log event
            Logger.log('<span class="event-negative"><i class="bi bi-lightning"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      }
    ],
    neutral: [
      {
        id: 'market_shift',
        title: 'Market Shift',
        description: 'The market is changing. Some companies leave, new ones arrive.',
        minProgressionStage: 1, // FIRST_SPACE
        duration: 7, // days
        probability: 0.5,
        effect: function() {
          // Balanced effect - more churn but also more leads
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.increaseChurnMultiplier && mis.increaseLeadMultiplier) {
            mis.increaseChurnMultiplier(1.2, this.duration);
            mis.increaseLeadMultiplier(1.2, this.duration);
            
            // Log event
            Logger.log('<span class="event-neutral"><i class="bi bi-arrow-left-right"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'industry_conference',
        title: 'Industry Conference',
        description: 'A major conference in town. Temporary members for 5 days.',
        minProgressionStage: 2, // GROWING
        duration: 5, // days
        probability: 0.4,
        effect: function() {
          // Add temporary members
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.addTemporaryMembers) {
            var memberCount = Math.floor(mis.memberUserCount() * 0.1); // 10% of current members
            if (memberCount < 5) memberCount = 5;
            mis.addTemporaryMembers(memberCount, this.duration);
            
            // Log event
            Logger.log('<span class="event-neutral"><i class="bi bi-calendar-event"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      },
      {
        id: 'press_coverage',
        title: 'Press Coverage',
        description: 'Your space was mentioned in a local newspaper. Mixed reactions from the community.',
        minProgressionStage: 3, // EXPANDING
        duration: 10, // days
        probability: 0.4,
        effect: function() {
          // More leads but slightly worse NPS
          var mis = AppStore.managementInformationSystem();
          if (mis && mis.increaseLeadMultiplier && mis.decreaseNps) {
            mis.increaseLeadMultiplier(1.25, this.duration);
            mis.decreaseNps(5, this.duration);
            
            // Log event
            Logger.log('<span class="event-neutral"><i class="bi bi-newspaper"></i> ' + this.title + ': ' + this.description + '</span>');
            needsUiUpdate = true;
            return true;
          }
          return false;
        }
      }
    ]
  };
  
  // Helper function to check if an event can trigger based on progression stage
  function canEventTrigger(event) {
    if (typeof ProgressionStore === 'undefined') {
      return true; // Allow events even if ProgressionStore not available
    }
    
    var currentStage = ProgressionStore.getStage();
    
    var stageLevels = {
      0: 0,  // INTRO
      'INTRO': 0,
      1: 1,  // FIRST_SPACE  
      'FIRST_SPACE': 1,
      2: 2,  // GROWING
      'GROWING': 2,
      3: 3,  // EXPANDING
      'EXPANDING': 3,
      4: 4,  // ESTABLISHED
      'ESTABLISHED': 4,
      5: 5,  // SCALING
      'SCALING': 5,
      6: 6,  // ENTERPRISE
      'ENTERPRISE': 6
    };
    
    var eventMinStage = stageLevels[event.minProgressionStage] || 0;
    var currentStageLevel = stageLevels[currentStage] || 0;
    
    // For demo purposes, make all events available sooner
    // This makes the game more interesting with events happening earlier
    return currentStageLevel >= Math.max(0, eventMinStage - 1);
  }
  
  // Helper to sample a random event from the pools
  function sampleEvent(category) {
    var allEventsInCategory = eventDefinitions[category];
    
    var eligibleEvents = allEventsInCategory.filter(canEventTrigger);
    
    if (!eligibleEvents.length) {
      // For early game, return any event from this category
      // regardless of progression level to make the game more interesting
      if (allEventsInCategory.length > 0) {
        return allEventsInCategory[0];
      }
      return null;
    }
    
    // Weight by probability
    var totalWeight = eligibleEvents.reduce(function(sum, event) {
      return sum + event.probability;
    }, 0);
    
    var randomValue = Math.random() * totalWeight;
    var currentWeight = 0;
    
    for (var i = 0; i < eligibleEvents.length; i++) {
      currentWeight += eligibleEvents[i].probability;
      if (randomValue <= currentWeight) {
        return eligibleEvents[i];
      }
    }
    
    return eligibleEvents[0]; // Fallback
  }
  
  // Helper to process active events
  function processActiveEvents() {
    var now = new Date();
    var toRemove = [];
    
    activeEvents.forEach(function(activeEvent, index) {
      if (activeEvent.endDate <= now) {
        // Event has ended
        toRemove.push(index);
        
        // Log event ending if it had a duration
        if (activeEvent.event.duration > 0) {
          Logger.log('<span class="event-ending"><i class="bi bi-check-circle"></i> The "' + 
              activeEvent.event.title + '" event has ended.</span>');
        }
      }
    });
    
    // Remove expired events (in reverse order to not mess up indices)
    for (var i = toRemove.length - 1; i >= 0; i--) {
      activeEvents.splice(toRemove[i], 1);
    }
  }
  
  // Helper to trigger an event
  function triggerEvent(eventCategory) {
    var event = sampleEvent(eventCategory);
    if (!event) {
      return false;
    }
    
    // Check if this event is already active
    var isAlreadyActive = activeEvents.some(function(activeEvent) {
      return activeEvent.event.id === event.id;
    });
    
    if (isAlreadyActive) {
      return false; // Don't trigger the same event twice
    }
    
    // Try to apply the event effect
    if (event.effect.call(event)) {
      // Event successfully applied
      var now = new Date();
      var endDate = new Date();
      endDate.setDate(now.getDate() + event.duration);
      
      // Add to active events if it has a duration
      if (event.duration > 0) {
        activeEvents.push({
          event: event,
          startDate: now,
          endDate: endDate
        });
      }
      
      // Record in history (with limit)
      eventHistory.push({
        id: event.id,
        title: event.title,
        category: eventCategory,
        date: now
      });
      
      // Limit the number of events in history
      if (eventHistory.length > maxEventHistory) {
        eventHistory = eventHistory.slice(-maxEventHistory);
      }
      
      // Update last event day
      lastEventDay = AppStore.date().getTime();
      
      // Update event history panel if available
      if (typeof window.updateEventHistory === 'function') {
        setTimeout(function() {
          window.updateEventHistory();
        }, 100);
      }
      
      return true;
    }
    
    return false;
  }
  
  // Public interface
  EventStore = {
    // Check for daily random events
    checkForDailyEvent: function() {
      // Process any active events first
      processActiveEvents();
      
      // If event lock is active, don't generate any new events
      if (eventLock) {
        return false;
      }
      
      // Check if we should process a daily event
      var now = AppStore.date().getTime();
      var daysSinceLastEvent = Math.floor((now - lastEventDay) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastEvent < minDaysBetweenEvents) {
        return false; // Too soon since last event
      }
      
      // Random chance to trigger event
      if (Math.random() > dailyEventChance) {
        return false; // No event today
      }
      
      // Determine event category
      var roll = Math.random();
      var category;
      
      if (roll < 0.4) { // 40% chance of positive
        category = 'positive';
      } else if (roll < 0.8) { // 40% chance of negative
        category = 'negative';
      } else { // 20% chance of neutral
        category = 'neutral';
      }
      
      var success = triggerEvent(category);
      if (success) {
        // Set the event lock to prevent more events until user action
        eventLock = true;
      }
      return success;
    },
    
    // Check for monthly events (more significant)
    checkForMonthlyEvent: function() {
      // If event lock is active, don't generate any new events
      if (eventLock) {
        return false;
      }
      
      // Process any active events first (just to be safe)
      processActiveEvents();
      
      if (Math.random() > monthlyEventChance) {
        return false; // No event this month
      }
      
      // Monthly events have different weights
      var roll = Math.random();
      var category;
      
      if (roll < 0.35) { // 35% chance of positive
        category = 'positive';
      } else if (roll < 0.75) { // 40% chance of negative
        category = 'negative';
      } else { // 25% chance of neutral
        category = 'neutral';
      }
      
      var success = triggerEvent(category);
      if (success) {
        // Set the event lock to prevent more events until user action
        eventLock = true;
      }
      return success;
    },
    
    // Check for quarterly events (major impact)
    checkForQuarterlyEvent: function() {
      // If event lock is active, don't generate any new events
      if (eventLock) {
        return false;
      }
      
      // Process any active events first (just to be safe)
      processActiveEvents();
      
      if (Math.random() > quarterlyEventChance) {
        return false; // No event this quarter
      }
      
      // Quarterly events are more balanced
      var roll = Math.random();
      var category;
      
      if (roll < 0.33) { // 33% chance of each type
        category = 'positive';
      } else if (roll < 0.66) {
        category = 'negative';
      } else {
        category = 'neutral';
      }
      
      var success = triggerEvent(category);
      if (success) {
        // Set the event lock to prevent more events until user action
        eventLock = true;
      }
      return success;
    },
    
    // Force trigger specific event (for debugging or scripted events)
    triggerSpecificEvent: function(eventId) {
      console.log("Attempting to trigger specific event:", eventId);
      
      // If event lock is active, don't generate any new events
      if (eventLock) {
        console.log("Event lock is active, can't trigger event");
        return false;
      }
      
      // Find the event in any category
      var foundEvent = null;
      var foundCategory = null;
      
      Object.keys(eventDefinitions).forEach(function(category) {
        eventDefinitions[category].forEach(function(event) {
          if (event.id === eventId) {
            foundEvent = event;
            foundCategory = category;
          }
        });
      });
      
      if (!foundEvent) {
        console.log("Event not found:", eventId);
        return false;
      }
      
      console.log("Found event:", foundEvent.id, "in category:", foundCategory);
      
      // Apply the event effect
      if (foundEvent.effect.call(foundEvent)) {
        console.log("Event effect applied successfully");
        
        var now = new Date();
        var endDate = new Date();
        endDate.setDate(now.getDate() + foundEvent.duration);
        
        // Add to active events if it has a duration
        if (foundEvent.duration > 0) {
          activeEvents.push({
            event: foundEvent,
            startDate: now,
            endDate: endDate
          });
          console.log("Added to active events with duration:", foundEvent.duration);
        }
        
        // Record in history (with limit)
        eventHistory.push({
          id: foundEvent.id,
          title: foundEvent.title,
          category: foundCategory,
          date: now
        });
        
        // Limit the number of events in history
        if (eventHistory.length > maxEventHistory) {
          eventHistory = eventHistory.slice(-maxEventHistory);
        }
        
        console.log("Added to event history, total events:", eventHistory.length);
        
        // Set event lock to prevent further events
        eventLock = true;
        
        // Update the UI
        if (typeof window.updateEventHistory === 'function') {
          window.updateEventHistory();
        }
        
        return true;
      }
      
      console.log("Failed to apply event effect");
      return false;
    },
    
    // Get active events
    getActiveEvents: function() {
      return activeEvents.slice(); // Return a copy
    },
    
    // Get event history
    getEventHistory: function() {
      return eventHistory.slice(); // Return a copy
    },
    
    // Adjust event probabilities
    setDailyEventChance: function(chance) {
      dailyEventChance = Math.min(Math.max(chance, 0), 1); // Clamp to 0-1
    },
    
    setMonthlyEventChance: function(chance) {
      monthlyEventChance = Math.min(Math.max(chance, 0), 1); // Clamp to 0-1
    },
    
    setQuarterlyEventChance: function(chance) {
      quarterlyEventChance = Math.min(Math.max(chance, 0), 1); // Clamp to 0-1
    },
    
    // Unlock events after user interactions
    unlockEvents: function() {
      eventLock = false;
    }
  };
})();