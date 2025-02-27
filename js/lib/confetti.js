// Simple confetti animation
var ConfettiAnimation = (function() {
  var canvas;
  var ctx;
  var particles = [];
  var colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
  var isRunning = false;
  var animationId;
  
  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: -10,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 1,
      angle: Math.random() * 2 * Math.PI,
      rotation: Math.random() * 0.2 - 0.1,
      opacity: 1
    };
  }
  
  function initCanvas() {
    // If canvas already exists, remove it
    var existingCanvas = document.getElementById('confetti-canvas');
    if (existingCanvas) {
      existingCanvas.parentNode.removeChild(existingCanvas);
    }
    
    // Create new canvas
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    ctx = canvas.getContext('2d');
  }
  
  function update() {
    if (!isRunning) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add new particles occasionally (25% chance each frame)
    if (Math.random() < 0.25 && particles.length < 200) {
      particles.push(createParticle());
    }
    
    // Update and draw each particle
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      
      // Update position
      p.y += p.speed;
      p.x += Math.sin(p.angle) * 2;
      
      // Update angle (creates swaying effect)
      p.angle += p.rotation;
      
      // Reduce opacity as it falls
      p.opacity -= 0.005;
      
      // If particle is out of screen or faded out, remove it
      if (p.y > canvas.height || p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }
      
      // Draw particle
      ctx.beginPath();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      
      // Randomize between circles and squares for variety
      if (Math.random() > 0.5) {
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      } else {
        ctx.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    // If all particles are gone, stop the animation
    if (particles.length === 0) {
      stop();
      return;
    }
    
    // Continue animation
    animationId = requestAnimationFrame(update);
  }
  
  function start(duration) {
    if (isRunning) stop();
    
    // Initialize canvas
    initCanvas();
    
    // Reset particles
    particles = [];
    
    // Add initial batch of particles
    for (var i = 0; i < 50; i++) {
      particles.push(createParticle());
    }
    
    // Start animation
    isRunning = true;
    update();
    
    // Auto-stop after duration if provided
    if (duration) {
      setTimeout(stop, duration);
    }
  }
  
  function stop() {
    isRunning = false;
    
    // Cancel animation frame
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    // Remove canvas
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }
  
  return {
    start: start,
    stop: stop
  };
})();