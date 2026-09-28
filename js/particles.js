/**
 * Ambient Particles & Exploding Star Spreading Animation Engine
 * Creates floating golden stardust, drifting jasmine petals, and
 * a massive celebratory explosion of 5-point gold & emerald stars when clicking "OPEN INVITATION".
 */

(function () {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let petals = [];
  let spreadingStars = [];

  const PARTICLE_COUNT = 40;
  const PETAL_COUNT = 14;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Helper: Draw 5-Point Star
  function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  // Floating Ambient Gold Stardust
  class GoldParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.2 + 0.8;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -Math.random() * 0.6 - 0.2;
      this.alpha = Math.random() * 0.7 + 0.2;
      this.alphaChange = (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1);
      this.color = Math.random() > 0.3 ? '#fceec5' : '#dfab52';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      this.alpha += this.alphaChange;
      if (this.alpha > 0.85 || this.alpha < 0.15) {
        this.alphaChange = -this.alphaChange;
      }

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
        this.y = height + 10;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#dfab52';
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Floating Jasmine / Rose Petals
  class FloralPetal {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20 - Math.random() * 50;
      this.size = Math.random() * 9 + 5;
      this.speedY = Math.random() * 0.9 + 0.5;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.7;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      this.color = Math.random() > 0.5 ? 'rgba(255, 230, 235, 0.45)' : 'rgba(255, 245, 220, 0.4)';
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.015) * 0.6;
      this.rotation += this.rotationSpeed;

      if (this.y > height + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.45, this.size, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ==========================================================
  // SPREADING 5-POINT STARS ENGINE (TRIGGERED ON BUTTON CLICK)
  // Shoots only from the left and right sides (ZERO in the middle)
  // ==========================================================
  class SpreadingStar {
    constructor(side) {
      // Spawn strictly from the left or right edges
      if (side === 'left') {
        this.x = Math.random() * 20;
        this.y = height * 0.72 + (Math.random() - 0.5) * 40;
        // Shoot inward and upward (angle around -55 to -70 degrees)
        const angle = -Math.PI / 3 + (Math.random() - 0.5) * 0.6;
        const speed = Math.random() * 12 + 6;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      } else {
        this.x = width - Math.random() * 20;
        this.y = height * 0.72 + (Math.random() - 0.5) * 40;
        // Shoot inward and upward (angle around -110 to -125 degrees)
        const angle = (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.6;
        const speed = Math.random() * 12 + 6;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }

      this.size = Math.random() * 10 + 6;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.25;

      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.008;

      const palette = ['#FFD700', '#F59E0B', '#FDE68A', '#10B981', '#FCEEC5', '#E6CA65'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.14; // gravity
      this.vx *= 0.985; // drag
      this.rotation += this.rotationSpeed;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;

      drawStar(ctx, 0, 0, 5, this.size, this.size * 0.45);
      ctx.fill();
      ctx.restore();
    }
  }

  // Initialize background elements
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new GoldParticle());
  }
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(new FloralPetal());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Background stardust
    for (let p of particles) {
      p.update();
      p.draw();
    }

    // Floating petals
    for (let pet of petals) {
      pet.update();
      pet.draw();
    }

    // Spreading stars burst (from two sides only)
    for (let i = spreadingStars.length - 1; i >= 0; i--) {
      spreadingStars[i].update();
      spreadingStars[i].draw();
      if (spreadingStars[i].alpha <= 0) {
        spreadingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  // ==========================================================
  // EXPORT: LAUNCH CELEBRATORY SPREADING STARS EXPLOSION
  // Only 2 sides (left & right cannons) - ZERO in the middle!
  // ==========================================================
  window.triggerStarCelebration = function () {
    // 1. Spawn custom 5-point stars ONLY from left and right edges
    for (let i = 0; i < 45; i++) {
      spreadingStars.push(new SpreadingStar('left'));
      spreadingStars.push(new SpreadingStar('right'));
    }

    // 2. Launch canvas-confetti stars from strictly left and right sides
    if (typeof confetti === 'function') {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const starColors = ["#D4AF37", "#FFD700", "#F59E0B", "#10B981", "#F3E5AB", "#064E3B"];

      const frame = () => {
        // Left cannon shooting inward & up (origin at x: 0)
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: starColors,
          shapes: ["star"],
          scalar: 1.25,
          zIndex: 9999
        });

        // Right cannon shooting inward & up (origin at x: 1)
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: starColors,
          shapes: ["star"],
          scalar: 1.25,
          zIndex: 9999
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  };

  // Backwards compatibility
  window.triggerSparkleBurst = window.triggerStarCelebration;
})();
