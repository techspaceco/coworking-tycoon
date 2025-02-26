var StaffStore;

(function() {
  // Internal state
  var staff = []; // All hired staff members
  var pastStaff = []; // Former staff members (fired/quit)
  var availablePositions = []; // Positions that can be filled 
  var openRequisitions = []; // Current job openings
  var projectHires = {}; // Keep track of staff hired through projects
  var staffRoles = {
    'community_manager': {
      title: 'Community Manager',
      description: 'Improves member satisfaction, reduces churn, and enhances the community experience.',
      unlockStage: 'FIRST_SPACE',
      maxCount: 3, // Maximum number that can be hired
      hireRequirement: 0, // Member count required before hiring
      unlockCondition: null // Function to check if unlock condition is met
    },
    'operations_manager': {
      title: 'Operations Manager',
      description: 'Reduces overhead costs and improves space utilization.',
      unlockStage: 'GROWING',
      maxCount: 2,
      hireRequirement: 50,
      unlockCondition: null
    },
    'sales_manager': {
      title: 'Sales Manager',
      description: 'Boosts sales volume and improves lead conversion.',
      unlockStage: 'GROWING',
      maxCount: 2,
      hireRequirement: 50,
      unlockCondition: function() {
        return typeof ProjectStore !== 'undefined' && 
               ProjectStore.isProjectCompleted && 
               ProjectStore.isProjectCompleted("Hire Sales Manager") &&
               ProjectStore.isProjectCompleted("Hiring Plan");
      }
    },
    'marketing_manager': {
      title: 'Marketing Manager',
      description: 'Generates more leads and improves brand visibility.',
      unlockStage: 'GROWING',
      maxCount: 2,
      hireRequirement: 50,
      unlockCondition: function() {
        return typeof ProjectStore !== 'undefined' && 
               ProjectStore.isProjectCompleted && 
               ProjectStore.isProjectCompleted("Hire Marketing Manager") &&
               ProjectStore.isProjectCompleted("Hiring Plan");
      }
    },
    'facilities_manager': {
      title: 'Facilities Manager',
      description: 'Reduces maintenance costs and improves space quality.',
      unlockStage: 'EXPANDING',
      maxCount: 2,
      hireRequirement: 100,
      unlockCondition: null
    },
    'it_manager': {
      title: 'IT Manager',
      description: 'Ensures technology runs smoothly and improves member satisfaction.',
      unlockStage: 'EXPANDING',
      maxCount: 1,
      hireRequirement: 150,
      unlockCondition: null
    }
  };
  
  // Initialize staff store
  function init() {
    updateAvailablePositions();
    
    // Check for existing staff projects and create staff members if needed
    if (typeof ProjectStore !== 'undefined' && ProjectStore.isProjectCompleted) {
      // Check for each staff project
      var staffProjects = ["Hire Office Manager", "Hire Sales Manager", "Hire Marketing Manager"];
      
      staffProjects.forEach(function(projectTitle) {
        if (ProjectStore.isProjectCompleted(projectTitle)) {
          console.log("Creating staff for already completed project: " + projectTitle);
          createStaffFromProject(projectTitle);
        }
      });
    }
  }
  
  // Update available positions based on current progression and staff count
  function updateAvailablePositions() {
    availablePositions = [];
    
    // Check if ProgressionStore exists
    if (typeof ProgressionStore === 'undefined') return;
    
    var currentStage = ProgressionStore.getStage();
    var stageMap = {
      'INTRO': 0,
      'FIRST_SPACE': 1,
      'GROWING': 2,
      'EXPANDING': 3,
      'ESTABLISHED': 4,
      'SCALING': 5,
      'ENTERPRISE': 6
    };
    
    var currentStageLevel = currentStage;
    var memberCount = 0;
    
    // Get current member count if MIS exists
    if (typeof AppStore !== 'undefined' && 
        AppStore.managementInformationSystem &&
        AppStore.managementInformationSystem().memberUserCount) {
      memberCount = AppStore.managementInformationSystem().memberUserCount();
    }
    
    // Check each role for availability
    for (var roleId in staffRoles) {
      var role = staffRoles[roleId];
      var roleStageLevel = role.unlockStage;
      if (typeof roleStageLevel === 'string') {
        roleStageLevel = stageMap[roleStageLevel] || 0;
      }
      
      // Count current staff in this role
      var currentCount = staff.filter(function(s) {
        return s.type() === roleId;
      }).length;
      
      // Check if the role is available based on:
      // 1. Progression stage
      // 2. Member count requirement
      // 3. Maximum count not exceeded
      // 4. Special unlock condition (if any)
      if (currentStageLevel >= roleStageLevel && 
          memberCount >= role.hireRequirement &&
          currentCount < role.maxCount &&
          (!role.unlockCondition || role.unlockCondition())) {
        availablePositions.push(roleId);
      }
    }
  }
  
  // Create a new job requisition for a role
  function createRequisition(roleId) {
    // Check if role is available to hire
    if (availablePositions.indexOf(roleId) === -1) {
      return false;
    }
    
    // Check if there's already an open requisition for this role
    var existingReq = openRequisitions.find(function(req) {
      return req.roleId === roleId;
    });
    
    if (existingReq) {
      return false;
    }
    
    // Create new requisition
    var requisition = {
      id: 'req_' + Math.floor(Math.random() * 1000000),
      roleId: roleId,
      title: staffRoles[roleId].title,
      createdOn: new Date(),
      status: 'open',
      candidates: generateCandidates(roleId, 3) // Generate 3 random candidates
    };
    
    openRequisitions.push(requisition);
    return requisition;
  }
  
  // Generate random candidates for a role
  function generateCandidates(roleId, count) {
    var candidates = [];
    var candidateCount = count || 3;
    
    for (var i = 0; i < candidateCount; i++) {
      // Create new staff member object with random attributes
      var options = {
        type: roleId,
        level: 1
      };
      
      var candidate = new StaffMember(options);
      candidates.push(candidate);
    }
    
    return candidates;
  }
  
  // Hire a candidate from a requisition
  function hireCandidateFromRequisition(requisitionId, candidateIndex) {
    // Find the requisition
    var requisition = openRequisitions.find(function(req) {
      return req.id === requisitionId;
    });
    
    if (!requisition || candidateIndex >= requisition.candidates.length) {
      return false;
    }
    
    // Get selected candidate
    var candidate = requisition.candidates[candidateIndex];
    
    // Add to staff
    staff.push(candidate);
    
    // Remove the requisition
    openRequisitions = openRequisitions.filter(function(req) {
      return req.id !== requisitionId;
    });
    
    // Update available positions
    updateAvailablePositions();
    
    // Add salary to MIS staff costs
    var mis = AppStore.managementInformationSystem();
    if (mis && typeof mis.clearOccupancyCache === 'function') {
      mis.clearOccupancyCache();
    }
    
    return candidate;
  }
  
  // Level up a staff member
  function levelUpStaff(staffId) {
    var staffMember = staff.find(function(s) {
      return s.id() === staffId;
    });
    
    if (!staffMember) {
      return false;
    }
    
    // Check if we can afford the level up
    var levelUpCost = staffMember.levelUpCost();
    var bankAccount = AppStore.bankAccount();
    
    if (bankAccount.balance() < levelUpCost) {
      return false;
    }
    
    // Pay for the level up
    bankAccount.withdraw(levelUpCost);
    
    // Level up the staff member
    staffMember.levelUp();
    
    // Update MIS staff costs due to salary increase
    var mis = AppStore.managementInformationSystem();
    if (mis && typeof mis.clearOccupancyCache === 'function') {
      mis.clearOccupancyCache();
    }
    
    return true;
  }
  
  // Training functions
  
  // Start training for a staff member
  function startStaffTraining(staffId, skillToTrain, durationDays) {
    var staffMember = staff.find(function(s) {
      return s.id() === staffId;
    });
    
    if (!staffMember) {
      return false;
    }
    
    // Calculate training cost based on duration and skill level
    var trainingCost = calculateTrainingCost(durationDays);
    
    // Check if we can afford it
    var bankAccount = AppStore.bankAccount();
    if (bankAccount.balance() < trainingCost) {
      return false;
    }
    
    // Start the training
    if (staffMember.startTraining(skillToTrain, durationDays)) {
      // Pay for the training
      bankAccount.withdraw(trainingCost);
      return true;
    }
    
    return false;
  }
  
  // Calculate training cost based on duration
  function calculateTrainingCost(durationDays) {
    // Base cost is £500 per week (£100 per day)
    return durationDays * 100;
  }
  
  // Cancel training for a staff member
  function cancelStaffTraining(staffId) {
    var staffMember = staff.find(function(s) {
      return s.id() === staffId;
    });
    
    if (!staffMember) {
      return false;
    }
    
    return staffMember.cancelTraining();
  }
  
  // Check if any staff members have completed training
  function checkTrainingCompletions() {
    var completions = [];
    
    staff.forEach(function(staffMember) {
      if (staffMember.checkTrainingCompletion()) {
        completions.push({
          id: staffMember.id(),
          name: staffMember.name(),
          type: staffMember.type(),
          title: staffMember.title()
        });
      }
    });
    
    return completions;
  }
  
  // Fire a staff member
  function fireStaff(staffId) {
    var staffIndex = -1;
    
    for (var i = 0; i < staff.length; i++) {
      if (staff[i].id() === staffId) {
        staffIndex = i;
        break;
      }
    }
    
    if (staffIndex === -1) {
      return false;
    }
    
    // Move to past staff
    pastStaff.push(staff[staffIndex]);
    
    // Remove from active staff
    staff.splice(staffIndex, 1);
    
    // Update available positions
    updateAvailablePositions();
    
    // Update MIS staff costs
    var mis = AppStore.managementInformationSystem();
    if (mis && typeof mis.clearOccupancyCache === 'function') {
      mis.clearOccupancyCache();
    }
    
    return true;
  }
  
  // Calculate total monthly staff cost
  function calculateMonthlyStaffCost() {
    // First log staff members to diagnose issues
    console.log("Staff count in calculateMonthlyStaffCost:", staff.length);
    
    var total = 0;
    
    // Loop through each staff member
    for (var i = 0; i < staff.length; i++) {
      var member = staff[i];
      var cost = 0;
      
      try {
        cost = member.monthlyCost();
        console.log("Staff cost for", member.name(), "(", member.title(), "):", cost);
      } catch(e) {
        console.error("Error calculating cost for staff member", i, e);
      }
      
      total += cost;
    }
    
    console.log("Total monthly staff cost:", total);
    return total;
  }
  
  // Get combined staff benefits
  function getStaffBenefits() {
    var benefits = {
      npsBoost: 0,
      churnReduction: 0,
      eventBudgetDiscount: 0,
      overheadReduction: 0,
      maintenanceCostReduction: 0,
      spaceUtilizationBoost: 0,
      salesBoost: 0,
      conversionRateBoost: 0,
      premiumPricingBoost: 0,
      leadBoost: 0,
      brandValueBoost: 0,
      marketingEfficiencyBoost: 0,
      memberSatisfactionBoost: 0,
      operationalEfficiencyBoost: 0,
      techSupportBoost: 0
    };
    
    // Add up benefits from all staff
    staff.forEach(function(staffMember) {
      var staffBenefits = staffMember.benefits();
      
      for (var benefit in staffBenefits) {
        if (benefits.hasOwnProperty(benefit)) {
          benefits[benefit] += staffBenefits[benefit];
        }
      }
    });
    
    return benefits;
  }
  
  // Get staff of a specific type
  function getStaffByType(type) {
    return staff.filter(function(s) {
      return s.type() === type;
    });
  }
  
  // Check if a staff type is unlocked
  function isStaffTypeUnlocked(type) {
    return availablePositions.indexOf(type) !== -1;
  }
  
  // Create staff from completed project
  function createStaffFromProject(projectTitle) {
    // Map project titles to staff types
    var projectToStaffType = {
      'Hire Office Manager': 'operations_manager',
      'Hire Sales Manager': 'sales_manager',
      'Hire Marketing Manager': 'marketing_manager'
    };
    
    // Check if this is a staff-related project
    var staffType = projectToStaffType[projectTitle];
    if (!staffType) return null;
    
    // Check if we've already created this staff member
    if (projectHires[projectTitle]) return projectHires[projectTitle];
    
    // Create high-quality staff member for the project (better than random hires)
    var options = {
      type: staffType,
      level: 1,
      name: generateStaffNameForProject(projectTitle)
    };
    
    // Create the staff member
    var staffMember = new StaffMember(options);
    
    // Add to staff list
    staff.push(staffMember);
    
    // Save in projectHires map
    projectHires[projectTitle] = staffMember;
    
    // Update available positions
    updateAvailablePositions();
    
    // Update MIS staff costs
    var mis = AppStore.managementInformationSystem();
    if (mis && typeof mis.clearOccupancyCache === 'function') {
      mis.clearOccupancyCache();
    }
    
    return staffMember;
  }
  
  // Generate appropriate names for project staff
  function generateStaffNameForProject(projectTitle) {
    var names = {
      'Hire Office Manager': 'Alex Morgan',
      'Hire Sales Manager': 'Jamie Taylor',
      'Hire Marketing Manager': 'Jordan Bailey'
    };
    
    return names[projectTitle] || 'New Staff Member';
  }
  
  // Public interface
  StaffStore = {
    // Get all staff
    getStaff: function() {
      return staff.slice(); // Return a copy
    },
    
    // Create staff from project (used by project callbacks)
    createStaffFromProject: function(projectTitle) {
      return createStaffFromProject(projectTitle);
    },
    
    // Get a single staff member by ID
    getStaffById: function(id) {
      return staff.find(function(s) {
        return s.id() === id;
      });
    },
    
    // Get staff by type
    getStaffByType: function(type) {
      return getStaffByType(type);
    },
    
    // Get all available positions that can be filled
    getAvailablePositions: function() {
      return availablePositions.slice(); // Return a copy
    },
    
    // Get all open requisitions
    getOpenRequisitions: function() {
      return openRequisitions.slice(); // Return a copy
    },
    
    // Get staff role information
    getStaffRoles: function() {
      return Object.assign({}, staffRoles); // Return a copy
    },
    
    // Create a new job requisition
    createRequisition: function(roleId) {
      return createRequisition(roleId);
    },
    
    // Hire a candidate
    hireCandidate: function(requisitionId, candidateIndex) {
      return hireCandidateFromRequisition(requisitionId, candidateIndex);
    },
    
    // Level up a staff member
    levelUpStaff: function(staffId) {
      return levelUpStaff(staffId);
    },
    
    // Fire a staff member
    fireStaff: function(staffId) {
      return fireStaff(staffId);
    },
    
    // Get total monthly staff cost
    getMonthlyStaffCost: function() {
      return calculateMonthlyStaffCost();
    },
    
    // Get combined staff benefits
    getStaffBenefits: function() {
      return getStaffBenefits();
    },
    
    // Check if a staff type is unlocked
    isStaffTypeUnlocked: function(type) {
      return isStaffTypeUnlocked(type);
    },
    
    // Update available positions (call when progression stage changes)
    updateAvailablePositions: function() {
      return updateAvailablePositions();
    },
    
    // Training methods
    startTraining: function(staffId, skillToTrain, durationDays) {
      return startStaffTraining(staffId, skillToTrain, durationDays);
    },
    
    cancelTraining: function(staffId) {
      return cancelStaffTraining(staffId);
    },
    
    checkTrainingCompletions: function() {
      return checkTrainingCompletions();
    },
    
    calculateTrainingCost: function(durationDays) {
      return calculateTrainingCost(durationDays);
    },
    
    // Initialize the store
    init: init
  };
})();