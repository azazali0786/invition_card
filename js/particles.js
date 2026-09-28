/**
 * Ambient Particles & Gold Sparkle Burst Engine
 * Creates floating golden stardust, gentle drifting rose petals, and celebration bursts.
 */

(function () {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let petals = [];
  let burstSparkles = [];

  const PARTICLE_COUNT = 45;
  const PETAL_COUNT = 15;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Particle Class for Gold Stardust
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

  // Petal Class for Soft Falling Jasmine / Rose Petals
  class FloralPetal {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20 - Math.random() * 50;
      this.size = Math.random() * 9 + 6;
      this.speedY = Math.random() * 1.0 + 0.6;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      this.color = Math.random() > 0.5 ? 'rgba(255, 230, 235, 0.55)' : 'rgba(255, 245, 220, 0.45)';
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

  // Sparkle Burst when Seal is broken
  class BurstSparkle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = Math.random() * 3 + 1.5;
      this.alpha = 1;
      this.decay = Math.random() * 0.025 + 0.015;
      this.color = Math.random() > 0.4 ? '#fffae6' : '#dfab52';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.08; // gravity
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffe39b';
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Initialize
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new GoldParticle());
  }
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(new FloralPetal());
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.update();
      p.draw();
    }

    for (let pet of petals) {
      pet.update();
      pet.draw();
    }

    for (let i = burstSparkles.length - 1; i >= 0; i--) {
      burstSparkles[i].update();
      burstSparkles[i].draw();
      if (burstSparkles[i].alpha <= 0) {
        burstSparkles.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  // Export Trigger Function for Seal Burst
  window.triggerSparkleBurst = function (x, y) {
    const originX = x || width / 2;
    const originY = y || height / 2;
    for (let i = 0; i < 80; i++) {
      burstSparkles.push(new BurstSparkle(originX, originY));
    }
  };
})();
