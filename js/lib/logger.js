var Logger;

(function() {
  var entries = [];

  Logger = {
    log: function (e) {
      // Keep track of log entries
      if (entries.length > 10) {
        entries.shift();
      }
      entries.push(e);

      // Instead of console output, display toast message
      if (typeof window.showToast === 'function') {
        window.showToast("Game Info", e, "bi bi-info-circle-fill me-2");
      } else {
        // Fallback if window.showToast is not available
        console.log("Game Info:", e);
        
        // Try basic toast implementation
        try {
          var toast = document.getElementById('event-notification');
          var toastTitle = document.getElementById('event-title');
          var toastDesc = document.getElementById('event-description');
          var toastIcon = document.getElementById('event-icon');
          
          if (toast && toastTitle && toastDesc) {
            toastTitle.textContent = "Game Info";
            toastIcon.className = "bi bi-info-circle-fill me-2";
            toastDesc.textContent = e;
            
            var bsToast = new bootstrap.Toast(toast, { delay: 8000 });
            bsToast.show();
          }
        } catch (err) {
          console.error("Error showing toast notification:", err);
        }
      }
    },
    
    // Provide access to the log history
    getEntries: function() {
      return entries.slice(); // Return a copy
    }
  };
})();
