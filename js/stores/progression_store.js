var ProgressionStore;

/**
 * This store manages game progression, feature unlocks, and narrative elements
 */
(function () {
  // Progression stages - each stage unlocks new features
  const STAGE = {
    INTRO: 0,          // Initial introduction stage
    FIRST_SPACE: 1,    // After acquiring first space
    GROWING: 2,        // After reaching ~30% occupancy
    EXPANDING: 3,      // After 100+ members
    ESTABLISHED: 4,    // After Series A funding
    SCALING: 5,        // After Series B funding
    ENTERPRISE: 6      // After Series C funding
  };
  
  // Current progression stage
  var currentStage = STAGE.INTRO;
  
  // State tracking for various progression triggers
  var hasAcquiredSpace = false;
  var hasReachedGrowthOccupancy = false;
  var hasRaisedSeriesA = false;
  var hasRaisedSeriesB = false;
  var hasRaisedSeriesC = false;
  
  // List of features with their unlock stages
  var features = {
    // Real Estate Market is always visible
    realEstateMarket: { unlockStage: STAGE.INTRO, visible: true },
    
    // Finance panel
    finance: { unlockStage: STAGE.INTRO, visible: true },
    
    // Product panel only shows after first space
    product: { unlockStage: STAGE.FIRST_SPACE, visible: false },
    communityEvents: { unlockStage: STAGE.INTRO, visible: false }, // Hidden until unlocked by project
    
    // Development panel
    development: { unlockStage: STAGE.FIRST_SPACE, visible: false },
    
    // Sales & Marketing panel components
    salesAndMarketing: { unlockStage: STAGE.INTRO, visible: true },
    occupancyGauge: { unlockStage: STAGE.FIRST_SPACE, visible: false },
    churnGauge: { unlockStage: STAGE.GROWING, visible: false },
    npsGauge: { unlockStage: STAGE.INTRO, visible: false }, // Added but hidden until projects unlock it
    salesControls: { unlockStage: STAGE.INTRO, visible: false }, // Hidden until Sales Manager project completed
    marketingControls: { unlockStage: STAGE.INTRO, visible: false }, // Hidden until Marketing Manager project completed
    
    // Staff Management panel
    staffManagement: { unlockStage: STAGE.GROWING, visible: false } // Hidden until Staff Management project completed
    
    // Projects panel
    projects: { unlockStage: STAGE.INTRO, visible: true }
  };
  
  // Narrative messages for each stage
  var stageMessages = {
    [STAGE.INTRO]: "Welcome to Coworking Tycoon! Start by acquiring your first property in the Real Estate Market.",
    [STAGE.FIRST_SPACE]: "Great! You've acquired your first space. Now you can adjust product settings and manage your business.",
    [STAGE.GROWING]: "Your business is growing! Keep an eye on churn and occupancy as you expand.",
    [STAGE.EXPANDING]: "You're building a strong community. Keep growing to attract investor interest.",
    [STAGE.ESTABLISHED]: "Congratulations on raising Series A! Your company is now established in the market.",
    [STAGE.SCALING]: "With Series B funding secured, you're ready to scale operations dramatically.",
    [STAGE.ENTERPRISE]: "You've reached enterprise scale with Series C funding. The sky's the limit now!"
  };
  
  // Projects to unlock at each stage
  var stageProjects = {
    [STAGE.INTRO]: [],
    [STAGE.FIRST_SPACE]: ["Run Community Events", "Improve Amenities"], // Hiring Plan disabled
    [STAGE.GROWING]: ["Hire Sales Manager", "Hire Marketing Manager"], // Hire Office Manager disabled
    [STAGE.EXPANDING]: ["Raise Series A"],
    [STAGE.ESTABLISHED]: ["Raise Series B"],
    [STAGE.SCALING]: ["Raise Series C"],
    [STAGE.ENTERPRISE]: ["Raise Series D"]
  };
  
  // Check if progression criteria are met and update stage
  function checkProgressionCriteria() {
    var changed = false;
    var mis = AppStore.managementInformationSystem();
    var spaces = AppStore.spaces();
    
    // Check for first space acquisition
    if (!hasAcquiredSpace && spaces.length > 0) {
      hasAcquiredSpace = true;
      if (currentStage < STAGE.FIRST_SPACE) {
        currentStage = STAGE.FIRST_SPACE;
        changed = true;
      }
    }
    
    // Check for growth occupancy threshold
    if (!hasReachedGrowthOccupancy && hasAcquiredSpace && mis.occupancy() >= 0.3) {
      hasReachedGrowthOccupancy = true;
      if (currentStage < STAGE.GROWING) {
        currentStage = STAGE.GROWING;
        changed = true;
      }
    }
    
    // Check for member count
    if (hasReachedGrowthOccupancy && mis.memberUserCount() >= 100 && currentStage < STAGE.EXPANDING) {
      currentStage = STAGE.EXPANDING;
      changed = true;
    }
    
    // Check for funding series completion
    if (!hasRaisedSeriesA && ProjectStore.isProjectCompleted("Raise Series A")) {
      hasRaisedSeriesA = true;
      if (currentStage < STAGE.ESTABLISHED) {
        currentStage = STAGE.ESTABLISHED;
        changed = true;
      }
    }
    
    if (!hasRaisedSeriesB && ProjectStore.isProjectCompleted("Raise Series B")) {
      hasRaisedSeriesB = true;
      if (currentStage < STAGE.SCALING) {
        currentStage = STAGE.SCALING;
        changed = true;
      }
    }
    
    if (!hasRaisedSeriesC && ProjectStore.isProjectCompleted("Raise Series C")) {
      hasRaisedSeriesC = true;
      if (currentStage < STAGE.ENTERPRISE) {
        currentStage = STAGE.ENTERPRISE;
        changed = true;
      }
    }
    
    // Update feature visibility based on current stage
    if (changed) {
      updateFeatureVisibility();
      showStageMessage();
    }
    
    return changed;
  }
  
  // Update feature visibility based on current stage
  function updateFeatureVisibility() {
    for (var featureKey in features) {
      if (features.hasOwnProperty(featureKey)) {
        var feature = features[featureKey];
        
        // Special handling for features that require projects
        if (featureKey === 'npsGauge') {
          // NPS gauge is unlocked by Community Events project
          continue; // Skip - handled by project completion
        } else if (featureKey === 'salesControls') {
          // Sales controls are unlocked by Sales Manager project AND Hiring Plan
          feature.visible = typeof ProjectStore !== 'undefined' && 
                            ProjectStore.isProjectCompleted && 
                            ProjectStore.isProjectCompleted("Hire Sales Manager") &&
                            ProjectStore.isProjectCompleted("Hiring Plan");
        } else if (featureKey === 'marketingControls') {
          // Marketing controls are unlocked by Marketing Manager project AND Hiring Plan
          feature.visible = typeof ProjectStore !== 'undefined' && 
                            ProjectStore.isProjectCompleted && 
                            ProjectStore.isProjectCompleted("Hire Marketing Manager") &&
                            ProjectStore.isProjectCompleted("Hiring Plan");
        } else if (featureKey === 'communityEvents') {
          // Community Events budget is unlocked by Run Community Events project
          feature.visible = typeof ProjectStore !== 'undefined' && 
                            ProjectStore.isProjectCompleted && 
                            ProjectStore.isProjectCompleted("Run Community Events");
        } else {
          // Standard progression-based visibility for other features
          feature.visible = currentStage >= feature.unlockStage;
        }
      }
    }
  }
  
  // Show message for current stage
  function showStageMessage() {
    var message = stageMessages[currentStage];
    if (message) {
      Logger.log(message);
    }
  }
  
  // Get visible projects for current stage
  function getVisibleProjects() {
    var visibleProjects = [];
    var stageKeys = Object.keys(stageProjects);
    
    // Add all projects from current and previous stages
    for (var i = 0; i <= currentStage; i++) {
      if (stageProjects[i]) {
        visibleProjects = visibleProjects.concat(stageProjects[i]);
      }
    }
    
    return visibleProjects;
  }
  
  // Initialize progression
  function init() {
    updateFeatureVisibility();
    // Don't show welcome message here - it's already shown in app.js
  }
  
  // Public API
  ProgressionStore = {
    STAGE: STAGE,
    
    // Get current progression stage
    getStage: function() {
      return currentStage;
    },
    
    // Check if a feature is unlocked
    isFeatureVisible: function(featureKey) {
      return features[featureKey] && features[featureKey].visible;
    },
    
    // Get array of visible projects based on progression
    getVisibleProjects: function() {
      return getVisibleProjects();
    },
    
    // Check progression criteria and update stage if needed
    updateProgression: function() {
      return checkProgressionCriteria();
    },
    
    // Manually set stage (for testing or explicit progression)
    setStage: function(stage) {
      if (stage >= STAGE.INTRO && stage <= STAGE.ENTERPRISE) {
        currentStage = stage;
        updateFeatureVisibility();
        showStageMessage();
        return true;
      }
      return false;
    },
    
    // Get the message for current stage
    getCurrentMessage: function() {
      return stageMessages[currentStage];
    },
    
    // Initialize the store
    init: init
  };
})();