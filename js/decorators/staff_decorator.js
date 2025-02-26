var StaffDecorator = {
  // Format skill level for display
  formatSkillLevel: function(level) {
    if (level >= 90) {
      return '<span class="text-success">Expert</span>';
    } else if (level >= 75) {
      return '<span class="text-success">Advanced</span>';
    } else if (level >= 60) {
      return '<span class="text-primary">Proficient</span>';
    } else if (level >= 40) {
      return '<span class="text-secondary">Basic</span>';
    } else {
      return '<span class="text-warning">Novice</span>';
    }
  },
  
  // Format salary for display
  formatSalary: function(salary) {
    return '£' + Util.numberWithCommas(salary) + '/mo';
  },
  
  // Format benefits for display
  formatBenefits: function(staffMember) {
    var benefits = staffMember.benefits();
    var output = [];
    
    // Go through each benefit type and format it nicely
    for (var key in benefits) {
      var value = benefits[key];
      var formattedValue;
      
      switch (key) {
        case 'npsBoost':
          if (value > 0) output.push('Improves NPS by +' + value + ' points');
          break;
        case 'churnReduction':
          if (value > 0) output.push('Reduces churn by ' + Math.round(value * 100) + '%');
          break;
        case 'eventBudgetDiscount':
          if (value > 0) output.push('Events budget ' + Math.round(value * 100) + '% more efficient');
          break;
        case 'overheadReduction':
          if (value > 0) output.push('Reduces overheads by ' + Math.round(value * 100) + '%');
          break;
        case 'maintenanceCostReduction':
          if (value > 0) output.push('Reduces maintenance costs by ' + Math.round(value * 100) + '%');
          break;
        case 'spaceUtilizationBoost':
          if (value > 0) output.push('Improves space utilization by ' + Math.round(value * 100) + '%');
          break;
        case 'salesBoost':
          if (value > 0) output.push('Boosts sales by ' + Math.round(value * 100) + '%');
          break;
        case 'conversionRateBoost':
          if (value > 0) output.push('Increases lead conversion by ' + Math.round(value * 100) + '%');
          break;
        case 'premiumPricingBoost':
          if (value > 0) output.push('Enables premium pricing of ' + Math.round(value * 100) + '%');
          break;
        case 'leadBoost':
          if (value > 0) output.push('Increases leads by ' + Math.round(value * 100) + '%');
          break;
        case 'brandValueBoost':
          if (value > 0) output.push('Improves brand value by ' + Math.round(value * 100) + '%');
          break;
        case 'marketingEfficiencyBoost':
          if (value > 0) output.push('Marketing ' + Math.round(value * 100) + '% more efficient');
          break;
        case 'memberSatisfactionBoost':
          if (value > 0) output.push('Improves member satisfaction by ' + Math.round(value * 100) + '%');
          break;
        case 'operationalEfficiencyBoost':
          if (value > 0) output.push('Improves operational efficiency by ' + Math.round(value * 100) + '%');
          break;
        case 'techSupportBoost':
          if (value > 0) output.push('Tech support ' + Math.round(value * 100) + '% more effective');
          break;
      }
    }
    
    return output.join('<br>');
  },
  
  // Create HTML for staff card
  createStaffCard: function(staffMember) {
    var html = '';
    var skills = staffMember.skills();
    var trainingStatus = staffMember.getTrainingStatus();
    
    html += '<div class="staff-card" data-staff-id="' + staffMember.id() + '">';
    html += '  <div class="staff-card-header">';
    html += '    <h5 class="staff-name">' + staffMember.name() + '</h5>';
    html += '    <div class="staff-title">' + staffMember.title() + '</div>';
    html += '    <div class="staff-level">Level ' + staffMember.level() + '</div>';
    html += '  </div>';
    html += '  <div class="staff-card-body">';
    html += '    <div class="staff-salary">' + this.formatSalary(staffMember.salary()) + '</div>';
    html += '    <div class="staff-skills">';
    html += '      <div class="skill-row" data-skill="leadership">Leadership: ' + this.formatSkillLevel(skills.leadership) + 
            (trainingStatus.inProgress && trainingStatus.skill === 'leadership' ? ' <span class="training-badge">Training</span>' : '') + '</div>';
    html += '      <div class="skill-row" data-skill="communication">Communication: ' + this.formatSkillLevel(skills.communication) + 
            (trainingStatus.inProgress && trainingStatus.skill === 'communication' ? ' <span class="training-badge">Training</span>' : '') + '</div>';
    html += '      <div class="skill-row" data-skill="organization">Organization: ' + this.formatSkillLevel(skills.organization) + 
            (trainingStatus.inProgress && trainingStatus.skill === 'organization' ? ' <span class="training-badge">Training</span>' : '') + '</div>';
    html += '      <div class="skill-row" data-skill="technical">Technical: ' + this.formatSkillLevel(skills.technical) + 
            (trainingStatus.inProgress && trainingStatus.skill === 'technical' ? ' <span class="training-badge">Training</span>' : '') + '</div>';
    html += '    </div>';
    
    // Show training status if in progress
    if (trainingStatus.inProgress) {
      var daysRemaining = staffMember.getTrainingDaysRemaining();
      html += '    <div class="training-status">';
      html += '      <div class="training-status-label">Training in progress</div>';
      html += '      <div class="training-details">';
      html += '        ' + trainingStatus.skill.charAt(0).toUpperCase() + trainingStatus.skill.slice(1) + ' +' + trainingStatus.improvementAmount + ' points';
      html += '      </div>';
      html += '      <div class="training-progress">';
      html += '        <div class="training-time">Completes in ' + daysRemaining + ' day' + (daysRemaining !== 1 ? 's' : '') + '</div>';
      html += '        <button class="btn btn-sm btn-warning cancel-training-button" data-staff-id="' + staffMember.id() + '">Cancel</button>';
      html += '      </div>';
      html += '    </div>';
    } else {
      // Show training options if not in training
      html += '    <div class="training-options">';
      html += '      <div class="training-option-label">Start Training:</div>';
      html += '      <div class="training-buttons">';
      html += '        <button class="btn btn-sm btn-info start-training-button" data-staff-id="' + staffMember.id() + '" data-skill="leadership" data-duration="7">Leadership (7d)</button>';
      html += '        <button class="btn btn-sm btn-info start-training-button" data-staff-id="' + staffMember.id() + '" data-skill="communication" data-duration="7">Communication (7d)</button>';
      html += '        <button class="btn btn-sm btn-info start-training-button" data-staff-id="' + staffMember.id() + '" data-skill="organization" data-duration="7">Organization (7d)</button>';
      html += '        <button class="btn btn-sm btn-info start-training-button" data-staff-id="' + staffMember.id() + '" data-skill="technical" data-duration="7">Technical (7d)</button>';
      html += '      </div>';
      html += '      <div class="training-cost-note">Training costs £' + Util.numberWithCommas(StaffStore.calculateTrainingCost(7)) + ' for 7 days</div>';
      html += '    </div>';
    }
    
    html += '    <div class="staff-benefits">';
    html += '      <div><strong>Benefits:</strong></div>';
    html += '      <div>' + this.formatBenefits(staffMember) + '</div>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="staff-card-footer">';
    html += '    <button class="btn btn-sm btn-primary level-up-button" data-staff-id="' + staffMember.id() + '">Level Up (£' + Util.numberWithCommas(staffMember.levelUpCost()) + ')</button>';
    html += '    <button class="btn btn-sm btn-danger fire-button" data-staff-id="' + staffMember.id() + '">Fire</button>';
    html += '  </div>';
    html += '</div>';
    
    return html;
  },
  
  // Create HTML for candidate card (similar to staff card but for hiring)
  createCandidateCard: function(candidate, requisitionId, candidateIndex) {
    var html = '';
    var skills = candidate.skills();
    
    html += '<div class="candidate-card" data-requisition-id="' + requisitionId + '" data-candidate-index="' + candidateIndex + '">';
    html += '  <div class="candidate-card-header">';
    html += '    <h5 class="candidate-name">' + candidate.name() + '</h5>';
    html += '    <div class="candidate-title">' + candidate.title() + '</div>';
    html += '  </div>';
    html += '  <div class="candidate-card-body">';
    html += '    <div class="candidate-salary">' + this.formatSalary(candidate.salary()) + '</div>';
    html += '    <div class="candidate-skills">';
    html += '      <div>Leadership: ' + this.formatSkillLevel(skills.leadership) + '</div>';
    html += '      <div>Communication: ' + this.formatSkillLevel(skills.communication) + '</div>';
    html += '      <div>Organization: ' + this.formatSkillLevel(skills.organization) + '</div>';
    html += '      <div>Technical: ' + this.formatSkillLevel(skills.technical) + '</div>';
    html += '    </div>';
    html += '    <div class="candidate-benefits">';
    html += '      <div><strong>Benefits:</strong></div>';
    html += '      <div>' + this.formatBenefits(candidate) + '</div>';
    html += '    </div>';
    html += '  </div>';
    html += '  <div class="candidate-card-footer">';
    html += '    <button class="btn btn-sm btn-success hire-button" data-requisition-id="' + requisitionId + '" data-candidate-index="' + candidateIndex + '">Hire</button>';
    html += '  </div>';
    html += '</div>';
    
    return html;
  },
  
  // Render all staff to the staff container
  renderStaff: function(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    // Get all staff
    var staff = StaffStore.getStaff();
    
    if (staff.length === 0) {
      container.innerHTML = '<div class="text-center p-3">No staff hired yet. Open positions in the Recruitment tab.</div>';
      return;
    }
    
    var html = '';
    
    // Group staff by type
    var staffByType = {};
    staff.forEach(function(staffMember) {
      var type = staffMember.type();
      if (!staffByType[type]) {
        staffByType[type] = [];
      }
      staffByType[type].push(staffMember);
    });
    
    // Render each type with header
    for (var type in staffByType) {
      var staffRoles = StaffStore.getStaffRoles();
      var roleTitle = staffRoles[type] ? staffRoles[type].title + 's' : 'Staff';
      
      html += '<h4 class="staff-type-header">' + roleTitle + '</h4>';
      html += '<div class="staff-type-container">';
      
      staffByType[type].forEach(function(staffMember) {
        html += this.createStaffCard(staffMember);
      }, this);
      
      html += '</div>';
    }
    
    container.innerHTML = html;
    
    // Add event listeners to buttons
    var levelUpButtons = container.querySelectorAll('.level-up-button');
    for (var i = 0; i < levelUpButtons.length; i++) {
      levelUpButtons[i].addEventListener('click', function(e) {
        var staffId = e.target.getAttribute('data-staff-id');
        if (StaffStore.levelUpStaff(staffId)) {
          // Success - refresh the UI
          this.renderStaff(containerId);
          needsUiUpdate = true;
        } else {
          // Failed - probably not enough money
          // Show toast notification
          if (typeof window.showToast === 'function') {
            window.showToast(
              "Insufficient Funds",
              "Cannot level up staff member - insufficient funds.",
              "bi bi-exclamation-circle-fill me-2"
            );
          } else {
            // Fallback if global function not available
            try {
              var toast = document.getElementById('event-notification');
              var toastTitle = document.getElementById('event-title');
              var toastDesc = document.getElementById('event-description');
              var toastIcon = document.getElementById('event-icon');
              
              if (toast && toastTitle && toastDesc) {
                toastTitle.textContent = "Insufficient Funds";
                toastIcon.className = "bi bi-exclamation-circle-fill me-2";
                toastDesc.textContent = "Cannot level up staff member - insufficient funds.";
                
                // Show the toast
                var bsToast = new bootstrap.Toast(toast, { delay: 8000 });
                bsToast.show();
              }
            } catch (err) {
              console.error("Error showing toast notification:", err);
            }
          }
        }
      }.bind(this));
    }
    
    // Add event listeners for training buttons
    var startTrainingButtons = container.querySelectorAll('.start-training-button');
    for (var i = 0; i < startTrainingButtons.length; i++) {
      startTrainingButtons[i].addEventListener('click', function(e) {
        var staffId = e.target.getAttribute('data-staff-id');
        var skill = e.target.getAttribute('data-skill');
        var duration = parseInt(e.target.getAttribute('data-duration'));
        
        if (StaffStore.startTraining(staffId, skill, duration)) {
          // Success - refresh the UI
          this.renderStaff(containerId);
          needsUiUpdate = true;
          
          // Show success toast
          if (typeof window.showToast === 'function') {
            window.showToast(
              "Training Started",
              "Staff member has started training in " + skill + ".",
              "bi bi-mortarboard-fill me-2"
            );
          } else {
            // Fallback if global function not available
            try {
              var toast = document.getElementById('event-notification');
              var toastTitle = document.getElementById('event-title');
              var toastDesc = document.getElementById('event-description');
              var toastIcon = document.getElementById('event-icon');
              
              if (toast && toastTitle && toastDesc) {
                toastTitle.textContent = "Training Started";
                toastIcon.className = "bi bi-mortarboard-fill me-2";
                toastDesc.textContent = "Staff member has started training in " + skill + ".";
                
                // Show the toast
                var bsToast = new bootstrap.Toast(toast, { delay: 8000 });
                bsToast.show();
              }
            } catch (err) {
              console.error("Error showing toast notification:", err);
            }
          }
        } else {
          // Failed - probably not enough money
          // Show toast notification
          if (typeof window.showToast === 'function') {
            window.showToast(
              "Insufficient Funds",
              "Cannot start training - insufficient funds.",
              "bi bi-exclamation-circle-fill me-2"
            );
          } else {
            // Fallback if global function not available
            try {
              var toast = document.getElementById('event-notification');
              var toastTitle = document.getElementById('event-title');
              var toastDesc = document.getElementById('event-description');
              var toastIcon = document.getElementById('event-icon');
              
              if (toast && toastTitle && toastDesc) {
                toastTitle.textContent = "Insufficient Funds";
                toastIcon.className = "bi bi-exclamation-circle-fill me-2";
                toastDesc.textContent = "Cannot start training - insufficient funds.";
                
                // Show the toast
                var bsToast = new bootstrap.Toast(toast, { delay: 8000 });
                bsToast.show();
              }
            } catch (err) {
              console.error("Error showing toast notification:", err);
            }
          }
        }
      }.bind(this));
    }
    
    // Add event listeners for cancel training buttons
    var cancelTrainingButtons = container.querySelectorAll('.cancel-training-button');
    for (var i = 0; i < cancelTrainingButtons.length; i++) {
      cancelTrainingButtons[i].addEventListener('click', function(e) {
        var staffId = e.target.getAttribute('data-staff-id');
        
        if (StaffStore.cancelTraining(staffId)) {
          // Success - refresh the UI
          this.renderStaff(containerId);
          needsUiUpdate = true;
          
          // Show success toast
          if (typeof window.showToast === 'function') {
            window.showToast(
              "Training Cancelled",
              "Staff training has been cancelled.",
              "bi bi-x-circle-fill me-2"
            );
          } else {
            // Fallback if global function not available
            try {
              var toast = document.getElementById('event-notification');
              var toastTitle = document.getElementById('event-title');
              var toastDesc = document.getElementById('event-description');
              var toastIcon = document.getElementById('event-icon');
              
              if (toast && toastTitle && toastDesc) {
                toastTitle.textContent = "Training Cancelled";
                toastIcon.className = "bi bi-x-circle-fill me-2";
                toastDesc.textContent = "Staff training has been cancelled.";
                
                // Show the toast
                var bsToast = new bootstrap.Toast(toast, { delay: 8000 });
                bsToast.show();
              }
            } catch (err) {
              console.error("Error showing toast notification:", err);
            }
          }
        }
      }.bind(this));
    }
    
    var fireButtons = container.querySelectorAll('.fire-button');
    for (var j = 0; j < fireButtons.length; j++) {
      fireButtons[j].addEventListener('click', function(e) {
        var staffId = e.target.getAttribute('data-staff-id');
        
        // Fire the staff member directly
        if (StaffStore.fireStaff(staffId)) {
          // Success - refresh the UI
          this.renderStaff(containerId);
          needsUiUpdate = true;
          
          // Show confirmation notification
          if (typeof window.showToast === 'function') {
            window.showToast(
              "Staff Member Fired",
              "You have fired a staff member.",
              "bi bi-person-x-fill me-2"
            );
          } else {
            // Fallback if global function not available
            try {
              var toast = document.getElementById('event-notification');
              var toastTitle = document.getElementById('event-title');
              var toastDesc = document.getElementById('event-description');
              var toastIcon = document.getElementById('event-icon');
              
              if (toast && toastTitle && toastDesc) {
                toastTitle.textContent = "Staff Member Fired";
                toastIcon.className = "bi bi-person-x-fill me-2";
                toastDesc.textContent = "You have fired a staff member.";
                
                // Show the toast
                var bsToast = new bootstrap.Toast(toast, { delay: 8000 });
                bsToast.show();
              }
            } catch (err) {
              console.error("Error showing toast notification:", err);
            }
          }
        } else {
          console.error("Error firing staff member with ID:", staffId);
        }
      }.bind(this));
    }
  },
  
  // Render available positions to the recruitment container
  renderRecruitment: function(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    // Get all available positions and open requisitions
    var availablePositions = StaffStore.getAvailablePositions();
    var openRequisitions = StaffStore.getOpenRequisitions();
    var staffRoles = StaffStore.getStaffRoles();
    
    var html = '';
    
    // Render open requisitions first
    if (openRequisitions.length > 0) {
      html += '<h4>Open Positions</h4>';
      
      openRequisitions.forEach(function(requisition, reqIndex) {
        html += '<div class="requisition-container" data-requisition-id="' + requisition.id + '">';
        html += '  <h5>' + requisition.title + ' Candidates</h5>';
        html += '  <div class="candidates-container">';
        
        requisition.candidates.forEach(function(candidate, candidateIndex) {
          html += this.createCandidateCard(candidate, requisition.id, candidateIndex);
        }, this);
        
        html += '  </div>';
        html += '</div>';
      }, this);
    }
    
    // Render available positions that don't have open requisitions
    if (availablePositions.length > 0) {
      var hasPositions = false;
      
      html += '<h4>Create Job Postings</h4>';
      html += '<div class="available-positions-container">';
      
      availablePositions.forEach(function(positionId) {
        // Check if there's already an open requisition for this role
        var hasOpenReq = openRequisitions.some(function(req) {
          return req.roleId === positionId;
        });
        
        if (!hasOpenReq) {
          hasPositions = true;
          var role = staffRoles[positionId];
          
          html += '<div class="position-card" data-position-id="' + positionId + '">';
          html += '  <div class="position-card-header">';
          html += '    <h5>' + role.title + '</h5>';
          html += '  </div>';
          html += '  <div class="position-card-body">';
          html += '    <p>' + role.description + '</p>';
          html += '  </div>';
          html += '  <div class="position-card-footer">';
          html += '    <button class="btn btn-primary create-requisition-button" data-position-id="' + positionId + '">Post Job</button>';
          html += '  </div>';
          html += '</div>';
        }
      });
      
      html += '</div>';
      
      // If all available positions already have requisitions
      if (!hasPositions) {
        html += '<div class="text-center p-3">All available positions have open job postings.</div>';
      }
    }
    
    // If no positions available or open
    if (availablePositions.length === 0 && openRequisitions.length === 0) {
      html += '<div class="text-center p-3">No positions available right now. Positions unlock as you progress in the game.</div>';
    }
    
    container.innerHTML = html;
    
    // Add event listeners to buttons
    var createReqButtons = container.querySelectorAll('.create-requisition-button');
    for (var i = 0; i < createReqButtons.length; i++) {
      createReqButtons[i].addEventListener('click', function(e) {
        var positionId = e.target.getAttribute('data-position-id');
        if (StaffStore.createRequisition(positionId)) {
          // Success - refresh the UI
          this.renderRecruitment(containerId);
        }
      }.bind(this));
    }
    
    // Add event listeners to hire buttons
    var hireButtons = container.querySelectorAll('.hire-button');
    for (var j = 0; j < hireButtons.length; j++) {
      hireButtons[j].addEventListener('click', function(e) {
        var requisitionId = e.target.getAttribute('data-requisition-id');
        var candidateIndex = parseInt(e.target.getAttribute('data-candidate-index'));
        
        if (StaffStore.hireCandidate(requisitionId, candidateIndex)) {
          // Success - refresh the UI
          this.renderRecruitment(containerId);
          needsUiUpdate = true;
        }
      }.bind(this));
    }
  },
  
  // Render all staff management UI
  renderStaffManagement: function() {
    this.renderStaff('staff-container');
    this.renderRecruitment('recruitment-container');
  },
  
  // Get total staff cost formatted for display
  getMonthlyStaffCostFormatted: function() {
    var cost = 0;
    if (typeof StaffStore !== 'undefined' && StaffStore.getMonthlyStaffCost) {
      cost = StaffStore.getMonthlyStaffCost();
    }
    return '£' + Util.numberWithCommas(cost) + '/mo';
  }
};