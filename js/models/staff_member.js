var StaffMember;

(function() {
  StaffMember = function(options) {
    var id = options.id || Math.floor(Math.random() * 1000000);
    var type = options.type || 'community_manager';
    var name = options.name || generateName();
    var salary = options.salary || staffTypes[type].baseSalary;
    var level = options.level || 1;
    var skills = options.skills || generateSkills(type);
    var hiredOn = options.hiredOn || new Date();
    var levelUpCost = calculateLevelUpCost();
    var training = options.training || {
      inProgress: false,
      completionDate: null,
      skill: null,
      improvementAmount: 0
    };
    var trainingHistory = options.trainingHistory || [];
    
    // Staff types with their base attributes
    var staffTypes = {
      community_manager: {
        title: 'Community Manager',
        baseSalary: 3000, // Monthly
        benefits: {
          npsBoost: 5,
          churnReduction: 0.1,
          eventBudgetDiscount: 0.15
        },
        levelBenefits: {
          npsBoost: 2,
          churnReduction: 0.05,
          eventBudgetDiscount: 0.05
        }
      },
      operations_manager: {
        title: 'Operations Manager',
        baseSalary: 3500,
        benefits: {
          overheadReduction: 0.1,
          maintenanceCostReduction: 0.15,
          spaceUtilizationBoost: 0.05
        },
        levelBenefits: {
          overheadReduction: 0.05,
          maintenanceCostReduction: 0.05,
          spaceUtilizationBoost: 0.02
        }
      },
      sales_manager: {
        title: 'Sales Manager',
        baseSalary: 4000,
        benefits: {
          salesBoost: 0.2, 
          conversionRateBoost: 0.15,
          premiumPricingBoost: 0.1
        },
        levelBenefits: {
          salesBoost: 0.05,
          conversionRateBoost: 0.05,
          premiumPricingBoost: 0.03
        }
      },
      marketing_manager: {
        title: 'Marketing Manager',
        baseSalary: 4000,
        benefits: {
          leadBoost: 0.25,
          brandValueBoost: 0.15,
          marketingEfficiencyBoost: 0.1
        },
        levelBenefits: {
          leadBoost: 0.05,
          brandValueBoost: 0.05,
          marketingEfficiencyBoost: 0.05
        }
      },
      facilities_manager: {
        title: 'Facilities Manager',
        baseSalary: 3200,
        benefits: {
          maintenanceCostReduction: 0.2,
          spaceUtilizationBoost: 0.1,
          memberSatisfactionBoost: 0.05
        },
        levelBenefits: {
          maintenanceCostReduction: 0.05,
          spaceUtilizationBoost: 0.03,
          memberSatisfactionBoost: 0.02
        }
      },
      it_manager: {
        title: 'IT Manager',
        baseSalary: 4500,
        benefits: {
          npsBoost: 3,
          operationalEfficiencyBoost: 0.15,
          techSupportBoost: 0.2
        },
        levelBenefits: {
          npsBoost: 1,
          operationalEfficiencyBoost: 0.05,
          techSupportBoost: 0.05
        }
      }
    };
    
    // List of first and last names for random generation
    var firstNames = ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Jamie', 'Charlie', 'Avery', 'Quinn', 'Skyler', 'Peyton', 'Reese', 'Cameron'];
    var lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
    
    // Generate a random name
    function generateName() {
      var first = firstNames[Math.floor(Math.random() * firstNames.length)];
      var last = lastNames[Math.floor(Math.random() * lastNames.length)];
      return first + ' ' + last;
    }
    
    // Generate a random set of skills based on staff type
    function generateSkills(type) {
      var baseSkills = {
        leadership: getRandomSkill(50, 80),
        communication: getRandomSkill(50, 80),
        organization: getRandomSkill(50, 80),
        technical: getRandomSkill(50, 80)
      };
      
      // Boost relevant skills based on staff type
      switch(type) {
        case 'community_manager':
          baseSkills.communication += 15;
          break;
        case 'operations_manager':
          baseSkills.organization += 15;
          break;
        case 'sales_manager':
          baseSkills.communication += 10;
          baseSkills.leadership += 5;
          break;
        case 'marketing_manager':
          baseSkills.communication += 10;
          baseSkills.organization += 5;
          break;
        case 'facilities_manager':
          baseSkills.technical += 15;
          break;
        case 'it_manager':
          baseSkills.technical += 20;
          break;
      }
      
      // Cap skills at 100
      for (var skill in baseSkills) {
        baseSkills[skill] = Math.min(baseSkills[skill], 100);
      }
      
      return baseSkills;
    }
    
    // Generate a random skill value
    function getRandomSkill(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Calculate the cost to level up this staff member
    function calculateLevelUpCost() {
      // Base cost is 2x monthly salary, with 50% increase per level
      return Math.round(salary * 2 * Math.pow(1.5, level - 1));
    }
    
    // Calculate the current monthly salary with level bonuses
    function calculateCurrentSalary() {
      // 10% salary increase per level
      return Math.round(salary * Math.pow(1.1, level - 1));
    }
    
    // Calculate benefits based on staff type and level
    function calculateBenefits() {
      var staffTypeBenefits = staffTypes[type].benefits;
      var levelBonuses = staffTypes[type].levelBenefits;
      var currentBenefits = {};
      
      // Add base benefits
      for (var benefit in staffTypeBenefits) {
        currentBenefits[benefit] = staffTypeBenefits[benefit];
        
        // Add level bonuses
        if (levelBonuses[benefit]) {
          currentBenefits[benefit] += levelBonuses[benefit] * (level - 1);
        }
      }
      
      return currentBenefits;
    }
    
    // Public methods
    this.id = function() {
      return id;
    };
    
    this.type = function() {
      return type;
    };
    
    this.title = function() {
      return staffTypes[type].title;
    };
    
    this.name = function() {
      return name;
    };
    
    this.level = function() {
      return level;
    };
    
    this.levelUp = function() {
      level++;
      levelUpCost = calculateLevelUpCost();
      return true;
    };
    
    this.levelUpCost = function() {
      return levelUpCost;
    };
    
    this.salary = function() {
      return calculateCurrentSalary();
    };
    
    this.monthlyCost = function() {
      var cost = this.salary();
      console.log("StaffMember " + name + " monthly cost:", cost);
      return cost;
    };
    
    this.skills = function() {
      return skills;
    };
    
    this.benefits = function() {
      return calculateBenefits();
    };
    
    this.hiredOn = function() {
      return hiredOn;
    };
    
    this.daysEmployed = function() {
      var today = AppStore.date();
      var timeDiff = Math.abs(today.getTime() - hiredOn.getTime());
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };
    
    // Training methods
    this.startTraining = function(skillToTrain, durationDays) {
      if (training.inProgress) {
        return false; // Already in training
      }
      
      // Check if skill is valid
      if (!skills.hasOwnProperty(skillToTrain)) {
        return false;
      }
      
      // Calculate training completion date
      var completionDate = new Date();
      completionDate.setTime(AppStore.date().getTime());
      Util.addDays(completionDate, durationDays);
      
      // Calculate expected improvement (5-15 points based on duration)
      var baseImprovement = 5 + Math.floor((durationDays / 7) * 5);
      // Cap at 15 points
      var improvementAmount = Math.min(baseImprovement, 15);
      
      // Update training state
      training = {
        inProgress: true,
        completionDate: completionDate,
        skill: skillToTrain,
        improvementAmount: improvementAmount
      };
      
      return true;
    };
    
    this.cancelTraining = function() {
      if (!training.inProgress) {
        return false;
      }
      
      training = {
        inProgress: false,
        completionDate: null,
        skill: null,
        improvementAmount: 0
      };
      
      return true;
    };
    
    this.checkTrainingCompletion = function() {
      if (!training.inProgress) {
        return false;
      }
      
      var today = AppStore.date();
      if (today >= training.completionDate) {
        // Training is complete, improve skill
        var skillName = training.skill;
        var improvement = training.improvementAmount;
        
        // Add to skill (cap at 100)
        skills[skillName] = Math.min(skills[skillName] + improvement, 100);
        
        // Add to training history
        trainingHistory.push({
          skill: skillName,
          improvement: improvement,
          completedOn: new Date(today.getTime())
        });
        
        // Reset training state
        training = {
          inProgress: false,
          completionDate: null,
          skill: null,
          improvementAmount: 0
        };
        
        return true; // Training was completed
      }
      
      return false; // Training still in progress
    };
    
    this.getTrainingStatus = function() {
      return training;
    };
    
    this.getTrainingHistory = function() {
      return trainingHistory;
    };
    
    this.getTrainingDaysRemaining = function() {
      if (!training.inProgress) {
        return 0;
      }
      
      var today = AppStore.date();
      var timeDiff = training.completionDate.getTime() - today.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };
  };
})();