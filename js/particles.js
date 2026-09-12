/**
 * particles.js - High-performance particle engine for temporal effects,
 * chronon dust, holographic glimmers, and paradox rifts.
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.glitchRects = [];
  }

  update(dt) {
    // Update active particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.sizeChange) {
        p.size = Math.max(0.2, p.size + p.sizeChange * dt);
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update glitch rects
    for (let i = this.glitchRects.length - 1; i >= 0; i--) {
      const g = this.glitchRects[i];
      g.life -= dt;
      if (g.life <= 0) {
        this.glitchRects.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Render digital glitch blocks if any exist
    if (this.glitchRects.length > 0) {
      ctx.save();
      for (let i = 0; i < this.glitchRects.length; i++) {
        const g = this.glitchRects[i];
        ctx.fillStyle = g.color;
        ctx.globalAlpha = g.alpha;
        ctx.fillRect(g.x, g.y, g.w, g.h);
      }
      ctx.restore();
    }
  }

  // Player movement thruster trail
  spawnPlayerDust(x, y, vx, vy) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y + (Math.random() * 4 - 2),
        vx: -vx * 0.2 + (Math.random() * 20 - 10),
        vy: -vy * 0.2 + (Math.random() * 20 - 10),
        size: Math.random() * 2.5 + 1.5,
        sizeChange: -1.2,
        color: Math.random() > 0.4 ? '#00f0ff' : '#00ffaa',
        life: 0.35,
        maxLife: 0.35,
        alpha: 0.8
      });
    }
  }

  // Anomaly / Rift ambient sparkle
  spawnRiftPulse(x, y, color = '#ff0077') {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 35 + 15;
    this.particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 3 + 1.5,
      sizeChange: -0.5,
      color: color,
      life: 0.8,
      maxLife: 0.8,
      alpha: 0.9
    });
  }

  // Flash Glitch effect across screen
  triggerGlitchBurst(count = 8) {
    for (let i = 0; i < count; i++) {
      this.glitchRects.push({
        x: Math.random() * 960,
        y: Math.random() * 600,
        w: Math.random() * 220 + 40,
        h: Math.random() * 14 + 3,
        color: Math.random() > 0.5 ? '#00f0ff' : '#ff0077',
        alpha: Math.random() * 0.45 + 0.25,
        life: Math.random() * 0.15 + 0.05
      });
    }
  }

  // Confetti / Victory sparks
  spawnCelebrationSparks(x, y) {
    const colors = ['#00f0ff', '#00ffaa', '#ffaa00', '#ff0077', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 160 + 40;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        sizeChange: -1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random() * 0.8 + 0.6,
        maxLife: 1.4,
        alpha: 1.0
      });
    }
  }
}

window.particleSystem = new ParticleSystem();
