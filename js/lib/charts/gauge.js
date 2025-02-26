// Simple Gauge Implementation
var SimpleGauge = (function() {
  function SimpleGauge(options) {
    this.canvas = options.canvas;
    this.minValue = options.minValue || 0;
    this.maxValue = options.maxValue || 100;
    this.value = options.value || 0;
    this.colorRanges = options.colorRanges || [
      { min: 0, max: 33, color: '#dc3545' },  // Red
      { min: 33, max: 66, color: '#ffc107' }, // Yellow
      { min: 66, max: 100, color: '#28a745' } // Green
    ];
    this.label = options.label || '';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    
    // For churn gauge, we want to invert colors (high churn is bad)
    this.invertColors = options.invertColors || false;
    
    this.draw();
  }
  
  SimpleGauge.prototype.updateValue = function(newValue) {
    this.value = newValue;
    this.draw();
  };
  
  SimpleGauge.prototype.draw = function() {
    var ctx = this.ctx;
    var centerX = this.width / 2;
    var centerY = this.height * 0.7; // Position gauge slightly above center
    var radius = Math.min(this.width, this.height) * 0.4;
    
    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw gauge background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
    ctx.lineWidth = radius * 0.2;
    ctx.strokeStyle = '#eeeeee';
    ctx.stroke();
    
    // Calculate normalized value (0-1)
    var normalizedValue = (this.value - this.minValue) / (this.maxValue - this.minValue);
    normalizedValue = Math.min(Math.max(normalizedValue, 0), 1); // Clamp between 0-1
    
    // Draw value arc
    var startAngle = Math.PI;
    var endAngle = startAngle + (normalizedValue * Math.PI);
    
    // Determine color based on value
    var gaugeColor;
    var percentValue = normalizedValue * 100;
    
    for (var i = 0; i < this.colorRanges.length; i++) {
      var range = this.colorRanges[i];
      if (percentValue >= range.min && percentValue <= range.max) {
        gaugeColor = range.color;
        break;
      }
    }
    
    // For churn, invert the color logic (high is bad)
    if (this.invertColors) {
      var temp = this.colorRanges.slice();
      temp.reverse();
      for (var i = 0; i < temp.length; i++) {
        var range = temp[i];
        if (percentValue >= range.min && percentValue <= range.max) {
          gaugeColor = range.color;
          break;
        }
      }
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.lineWidth = radius * 0.2;
    ctx.strokeStyle = gaugeColor;
    ctx.stroke();
    
    // Draw value text
    ctx.font = 'bold ' + (radius * 0.5) + 'px Arial';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.value + '%', centerX, centerY + radius * 0.6);
    
    // Draw label
    ctx.font = (radius * 0.25) + 'px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, centerX, centerY - radius * 0.3);
  };
  
  return SimpleGauge;
})();