// Simple Line Chart Implementation
var SimpleLineChart = (function() {
  function SimpleLineChart(options) {
    this.canvas = options.canvas;
    this.datasets = options.datasets || [];
    this.maxDataPoints = options.maxDataPoints || 12;
    this.title = options.title || '';
    this.yAxisLabel = options.yAxisLabel || '';
    this.xAxisLabel = options.xAxisLabel || '';
    this.labelColor = options.labelColor || '#666666';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.padding = options.padding || 30;
    this.legend = options.legend !== false;
    
    // For backward compatibility
    if (options.data) {
      this.datasets = [{
        data: options.data,
        label: 'Data',
        lineColor: options.lineColor || '#28a745',
        fillColor: options.fillColor || 'rgba(40, 167, 69, 0.2)'
      }];
    }
    
    this.draw();
  }
  
  SimpleLineChart.prototype.updateData = function(newData, datasetIndex) {
    if (Array.isArray(newData) && typeof datasetIndex === 'undefined') {
      // If no dataset index is specified, assume it's for the first dataset
      if (this.datasets.length === 0) {
        this.datasets.push({
          data: [],
          label: 'Data',
          lineColor: '#28a745',
          fillColor: 'rgba(40, 167, 69, 0.2)'
        });
      }
      // Keep only the most recent data points
      this.datasets[0].data = newData.slice(-this.maxDataPoints);
    } else if (Array.isArray(newData) && typeof datasetIndex === 'number') {
      // Update the specified dataset
      if (this.datasets[datasetIndex]) {
        this.datasets[datasetIndex].data = newData.slice(-this.maxDataPoints);
      }
    } else if (typeof newData === 'object' && Array.isArray(newData.datasets)) {
      // Multiple datasets update
      this.datasets = newData.datasets;
    }
    
    this.draw();
  };
  
  SimpleLineChart.prototype.draw = function() {
    var ctx = this.ctx;
    var width = this.width;
    var height = this.height;
    var padding = this.padding;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Return early if no datasets
    if (!this.datasets || this.datasets.length === 0 || 
        (this.datasets.length > 0 && (!this.datasets[0].data || this.datasets[0].data.length === 0))) {
      ctx.font = '12px Arial';
      ctx.fillStyle = this.labelColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No data available', width / 2, height / 2);
      return;
    }
    
    // Draw title
    if (this.title) {
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(this.title, width / 2, 5);
    }
    
    // Get all data points from all datasets to find max and x labels
    var allDataPoints = [];
    var dataLabels = [];
    
    this.datasets.forEach(function(dataset) {
      if (dataset.data && dataset.data.length > 0) {
        allDataPoints = allDataPoints.concat(dataset.data.map(function(point) {
          return point.value;
        }));
        
        // Get labels from first dataset (assuming all datasets use same x-axis labels)
        if (dataLabels.length === 0 && dataset.data.length > 0) {
          dataLabels = dataset.data.map(function(point) {
            return point.label;
          });
        }
      }
    });
    
    // Find max value for scaling
    var maxValue = Math.max.apply(null, allDataPoints);
    var minValue = 0; // Always start Y-axis at zero
    
    // Add 10% padding to the top of the chart
    maxValue = maxValue + maxValue * 0.1;
    
    // Calculate drawing area
    var drawAreaWidth = width - (padding * 2);
    var drawAreaHeight = height - (padding * 2);
    
    // Reserve space for legend if it's enabled and we have multiple datasets
    var legendHeight = 0;
    if (this.legend && this.datasets.length > 1) {
      legendHeight = 20;
      drawAreaHeight -= legendHeight;
    }
    
    // Calculate x and y step
    var xStep = dataLabels.length > 1 ? drawAreaWidth / (dataLabels.length - 1) : drawAreaWidth;
    var yRange = maxValue - minValue;
    
    // Draw y-axis labels
    ctx.font = '10px Arial';
    ctx.fillStyle = this.labelColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    var yLabelStep = yRange / 4;
    for (var i = 0; i <= 4; i++) {
      var yValue = minValue + (yLabelStep * i);
      var yPos = height - padding - legendHeight - (((yValue - minValue) / yRange) * drawAreaHeight);
      var labelText = '';
      
      // Format based on value size
      if (yValue >= 1000000) {
        labelText = '£' + (yValue / 1000000).toFixed(1) + 'M';
      } else if (yValue >= 1000) {
        labelText = '£' + (yValue / 1000).toFixed(1) + 'K';
      } else {
        labelText = '£' + yValue.toFixed(0);
      }
      
      ctx.fillText(labelText, padding - 5, yPos);
      
      // Draw horizontal grid line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.moveTo(padding, yPos);
      ctx.lineTo(width - padding, yPos);
      ctx.stroke();
    }
    
    // Draw x-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Only show a subset of labels to avoid crowding
    var labelInterval = Math.ceil(dataLabels.length / 6);
    
    for (var i = 0; i < dataLabels.length; i++) {
      if (i % labelInterval === 0 || i === dataLabels.length - 1) {
        var xPos = padding + (i * xStep);
        ctx.fillText(dataLabels[i], xPos, height - padding - legendHeight + 5);
      }
    }
    
    // Draw y-axis
    ctx.beginPath();
    ctx.strokeStyle = '#999999';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding - legendHeight);
    ctx.stroke();
    
    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - legendHeight);
    ctx.lineTo(width - padding, height - padding - legendHeight);
    ctx.stroke();
    
    // Draw each dataset
    this.datasets.forEach(function(dataset, datasetIndex) {
      if (!dataset.data || dataset.data.length === 0) return;
      
      var lineColor = dataset.lineColor || '#28a745';
      var fillColor = dataset.fillColor || 'rgba(40, 167, 69, 0.2)';
      
      // Draw line for this dataset
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      
      // Draw data points
      for (var i = 0; i < dataset.data.length; i++) {
        var xPos = padding + (i * xStep);
        var yPos = height - padding - legendHeight - (((dataset.data[i].value - minValue) / yRange) * drawAreaHeight);
        
        if (i === 0) {
          ctx.moveTo(xPos, yPos);
        } else {
          ctx.lineTo(xPos, yPos);
        }
      }
      
      ctx.stroke();
      
      // Fill area under the line for first dataset only
      if (datasetIndex === 0) {
        ctx.lineTo(padding + ((dataset.data.length - 1) * xStep), height - padding - legendHeight);
        ctx.lineTo(padding, height - padding - legendHeight);
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
      
      // Draw data points
      for (var i = 0; i < dataset.data.length; i++) {
        var xPos = padding + (i * xStep);
        var yPos = height - padding - legendHeight - (((dataset.data[i].value - minValue) / yRange) * drawAreaHeight);
        
        ctx.beginPath();
        ctx.arc(xPos, yPos, 3, 0, 2 * Math.PI);
        ctx.fillStyle = lineColor;
        ctx.fill();
      }
    });
    
    // Draw legend if it's enabled and we have multiple datasets
    if (this.legend && this.datasets.length > 1) {
      var legendY = height - legendHeight + 10;
      var legendX = padding;
      // Adjust spacing based on number of datasets
      var legendSpacing = this.datasets.length <= 2 ? 100 : 90;
      
      this.datasets.forEach(function(dataset, index) {
        var lineColor = dataset.lineColor || '#28a745';
        var datasetLabel = dataset.label || 'Dataset ' + (index + 1);
        
        // Draw legend color box
        ctx.fillStyle = lineColor;
        ctx.fillRect(legendX, legendY - 8, 12, 6);
        
        // Draw legend text
        ctx.fillStyle = '#333333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(datasetLabel, legendX + 18, legendY - 5);
        
        // Move x position for next legend item
        legendX += legendSpacing;
      });
    }
    
    // Draw axis labels
    if (this.yAxisLabel) {
      ctx.save();
      ctx.translate(10, height / 2 - legendHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = this.labelColor;
      ctx.font = '11px Arial';
      ctx.fillText(this.yAxisLabel, 0, 0);
      ctx.restore();
    }
    
    if (this.xAxisLabel) {
      ctx.textAlign = 'center';
      ctx.fillStyle = this.labelColor;
      ctx.font = '11px Arial';
      ctx.fillText(this.xAxisLabel, width / 2, height - 5);
    }
  };
  
  return SimpleLineChart;
})();