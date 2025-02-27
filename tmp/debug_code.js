// Create a test script to verify if staff costs are calculated correctly
console.log("Starting staff cost debug test");

// Check if StaffStore exists
console.log("StaffStore exists:", typeof StaffStore !== 'undefined');
if (typeof StaffStore !== 'undefined') {
  // Check if staff is initialized
  if (typeof StaffStore.init === 'function') {
    console.log("Initializing StaffStore");
    StaffStore.init();
  }
  
  // Check if getMonthlyStaffCost exists
  console.log("getMonthlyStaffCost exists:", typeof StaffStore.getMonthlyStaffCost === 'function');
  
  // Get staff members
  if (typeof StaffStore.getStaff === 'function') {
    const staff = StaffStore.getStaff();
    console.log("Number of staff members:", staff.length);
    
    // Check each staff member's salary
    staff.forEach((member, index) => {
      console.log(`Staff ${index + 1}: ${member.name()} (${member.title()}) - Salary: ${member.salary()} - Monthly cost: ${member.monthlyCost()}`);
    });
    
    // Calculate total monthly cost manually
    const totalCost = staff.reduce((sum, member) => sum + member.monthlyCost(), 0);
    console.log("Manually calculated total monthly cost:", totalCost);
    
    // Compare with StaffStore's calculation
    if (typeof StaffStore.getMonthlyStaffCost === 'function') {
      const storeCost = StaffStore.getMonthlyStaffCost();
      console.log("StaffStore.getMonthlyStaffCost():", storeCost);
      console.log("Costs match:", totalCost === storeCost);
    }
  }
}

// Check if StaffDecorator exists and works
console.log("\nStaffDecorator exists:", typeof StaffDecorator !== 'undefined');
if (typeof StaffDecorator !== 'undefined') {
  console.log("getMonthlyStaffCostFormatted exists:", typeof StaffDecorator.getMonthlyStaffCostFormatted === 'function');
  
  if (typeof StaffDecorator.getMonthlyStaffCostFormatted === 'function') {
    console.log("Formatted monthly staff cost:", StaffDecorator.getMonthlyStaffCostFormatted());
  }
}

// Check if the DOM element for staff cost exists and has the correct value
const staffCostElement = document.getElementById('staff-monthly-cost');
console.log("\nstaff-monthly-cost element exists:", staffCostElement !== null);
if (staffCostElement) {
  console.log("Current displayed staff cost:", staffCostElement.textContent);
}

// Check if the UI update function works
console.log("\nneedsUiUpdate exists:", typeof needsUiUpdate !== 'undefined');
if (typeof needsUiUpdate !== 'undefined') {
  console.log("Current needsUiUpdate value:", needsUiUpdate);
  console.log("Setting needsUiUpdate to true to force refresh");
  needsUiUpdate = true;
}

// Check MIS staff cost calculation
console.log("\nChecking MIS staff cost calculation");
if (typeof AppStore !== 'undefined' && AppStore.managementInformationSystem) {
  const mis = AppStore.managementInformationSystem();
  console.log("MIS exists:", mis !== null);
  
  if (mis && typeof mis.monthlyStaffCost === 'function') {
    console.log("MIS.monthlyStaffCost():", mis.monthlyStaffCost());
    
    // Check for staffStoreCost within the function
    console.log("Clearing cache to force recalculation");
    if (typeof mis.clearOccupancyCache === 'function') {
      mis.clearOccupancyCache();
      console.log("Cache cleared, recalculating staff cost");
      console.log("MIS.monthlyStaffCost() after cache clear:", mis.monthlyStaffCost());
    }
  }
}

console.log("Debug test complete");