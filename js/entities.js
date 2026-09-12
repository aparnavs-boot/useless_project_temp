/**
 * entities.js - Player (Agent Chrono) and NPCs (Socrates, Archimedes, Oracle, Merchant)
 * with multi-state visual sprites, animations, and collision.
 */

class Player {
  constructor(x = 480, y = 300) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = 175;
    this.radius = 14;
    this.facing = 'down'; // 'up', 'down', 'left', 'right'
    this.walkCycle = 0;
    this.isMoving = false;
  }

  update(dt, inputKeys, world) {
    let dx = 0;
    let dy = 0;

    if (inputKeys['KeyW'] || inputKeys['ArrowUp']) dy -= 1;
    if (inputKeys['KeyS'] || inputKeys['ArrowDown']) dy += 1;
    if (inputKeys['KeyA'] || inputKeys['ArrowLeft']) dx -= 1;
    if (inputKeys['KeyD'] || inputKeys['ArrowRight']) dx += 1;

    // Normalizing diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    const currentSpeed = (inputKeys['ShiftLeft'] || inputKeys['ShiftRight']) ? this.speed * 1.35 : this.speed;

    this.vx = dx * currentSpeed;
    this.vy = dy * currentSpeed;
    this.isMoving = (dx !== 0 || dy !== 0);

    // Update facing
    if (Math.abs(dx) > Math.abs(dy)) {
      this.facing = dx > 0 ? 'right' : 'left';
    } else if (Math.abs(dy) > 0) {
      this.facing = dy > 0 ? 'down' : 'up';
    }

    // Attempt X movement with collision check
    const nextX = this.x + this.vx * dt;
    if (!world.checkCollision(nextX, this.y, this.radius)) {
      this.x = nextX;
    }

    // Attempt Y movement with collision check
    const nextY = this.y + this.vy * dt;
    if (!world.checkCollision(this.x, nextY, this.radius)) {
      this.y = nextY;
    }

    // Animation & particles
    if (this.isMoving) {
      this.walkCycle += dt * 10;
      if (Math.random() < 0.4) {
        window.particleSystem.spawnPlayerDust(this.x, this.y + 12, this.vx, this.vy);
      }
    } else {
      this.walkCycle = 0;
    }
  }

  render(ctx) {
    ctx.save();

    // Player ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 15, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const legBob = Math.sin(this.walkCycle) * 3;

    // Legs / Boots
    ctx.fillStyle = '#1e293b';
    // Left Leg
    ctx.fillRect(this.x - 7, this.y + 6 + legBob, 5, 10);
    // Right Leg
    ctx.fillRect(this.x + 2, this.y + 6 - legBob, 5, 10);

    // Glowing Boot Thrusters
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(this.x - 7, this.y + 15 + legBob, 5, 2);
    ctx.fillRect(this.x + 2, this.y + 15 - legBob, 5, 2);

    // Torso / Chrono Armor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(this.x - 9, this.y - 10, 18, 18);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - 9, this.y - 10, 18, 18);

    // T.E.D. Forearm projector glow
    ctx.fillStyle = '#00ffaa';
    ctx.beginPath();
    ctx.arc(this.facing === 'left' ? this.x - 8 : this.x + 8, this.y - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Head / Chrono Helmet
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 16, 9, 0, Math.PI * 2);
    ctx.fill();

    // Visor with dynamic neon glow
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    if (this.facing === 'left') {
      ctx.fillRect(this.x - 9, this.y - 18, 6, 4);
    } else if (this.facing === 'right') {
      ctx.fillRect(this.x + 3, this.y - 18, 6, 4);
    } else if (this.facing === 'up') {
      ctx.fillStyle = '#334155'; // Back of helmet
      ctx.fillRect(this.x - 5, this.y - 18, 10, 3);
    } else {
      ctx.fillRect(this.x - 6, this.y - 18, 12, 4);
    }

    ctx.restore();
  }
}

class NPC {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.title = config.title;
    this.x = config.x;
    this.y = config.y;
    this.portraitEmoji = config.portraitEmoji;
    this.radius = 18;
    this.holdingItem = config.holdingItem || null;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  isNear(px, py, dist = 50) {
    const dx = px - this.x;
    const dy = py - this.y;
    return (dx * dx + dy * dy) < (dist * dist);
  }

  render(ctx, time, timelineState) {
    ctx.save();
    const bob = Math.sin(time * 3 + this.bobOffset) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 16, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // NPC Body rendering based on character and timeline state
    if (this.id === 'socrates') {
      this.renderSocrates(ctx, bob, timelineState);
    } else if (this.id === 'archimedes') {
      this.renderArchimedes(ctx, bob, timelineState);
    } else if (this.id === 'oracle') {
      this.renderOracle(ctx, bob, timelineState);
    } else if (this.id === 'merchant') {
      this.renderMerchant(ctx, bob, timelineState);
    }

    // Held Item Indicator
    if (this.holdingItem) {
      ctx.font = '14px serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.holdingItem.icon, this.x + 14, this.y - 2 + bob);
    }

    // Interactive speech indicator beacon above head
    ctx.fillStyle = timelineState === 3 ? '#ff0077' : '#00f0ff';
    ctx.font = 'bold 12px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('💬', this.x, this.y - 34 + bob);

    ctx.restore();
  }

  renderSocrates(ctx, bob, timelineState) {
    // Robe / Toga
    ctx.fillStyle = timelineState === 3 ? '#ff0077' : (timelineState === 2 ? '#3b82f6' : '#f8fafc');
    ctx.fillRect(this.x - 10, this.y - 8 + bob, 20, 24);

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 14 + bob, 10, 0, Math.PI * 2);
    ctx.fill();

    // White Beard
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 8 + bob, 7, 0, Math.PI);
    ctx.fill();

    // Accessory
    if (timelineState === 3) {
      // DJ Headphones & Shutter shades
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(this.x - 7, this.y - 17 + bob, 14, 4); // Shades
      ctx.fillStyle = '#facc15';
      ctx.fillRect(this.x - 12, this.y - 18 + bob, 4, 8); // Headphone L
      ctx.fillRect(this.x + 8, this.y - 18 + bob, 4, 8);  // Headphone R
    } else if (timelineState === 2) {
      // Blue glowing smart glasses
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(this.x - 6, this.y - 16 + bob, 12, 3);
    }
  }

  renderArchimedes(ctx, bob, timelineState) {
    // Engineer Tunic
    ctx.fillStyle = timelineState === 3 ? '#9333ea' : (timelineState === 2 ? '#d97706' : '#b45309');
    ctx.fillRect(this.x - 10, this.y - 8 + bob, 20, 24);

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 14 + bob, 10, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Bald crown
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.arc(this.x - 8, this.y - 14 + bob, 4, 0, Math.PI * 2);
    ctx.arc(this.x + 8, this.y - 14 + bob, 4, 0, Math.PI * 2);
    ctx.fill();

    // Accessory
    if (timelineState === 3) {
      // Cyborg glowing laser eye
      ctx.fillStyle = '#ff0077';
      ctx.beginPath();
      ctx.arc(this.x + 3, this.y - 15 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (timelineState === 2) {
      // Welder goggles
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(this.x - 7, this.y - 17 + bob, 14, 4);
    }
  }

  renderOracle(ctx, bob, timelineState) {
    // Oracle Mystic Robes
    ctx.fillStyle = timelineState === 3 ? '#00f0ff' : (timelineState === 2 ? '#059669' : '#14b8a6');
    ctx.fillRect(this.x - 9, this.y - 8 + bob, 18, 24);

    // Head
    ctx.fillStyle = '#fce7f3';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 14 + bob, 9, 0, Math.PI * 2);
    ctx.fill();

    // Mystic Veil / Laurel
    ctx.fillStyle = timelineState === 3 ? '#ff0077' : '#15803d';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 20 + bob, 6, 0, Math.PI);
    ctx.fill();

    // State 3: Holographic floating rings
    if (timelineState === 3) {
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y - 10 + bob, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderMerchant(ctx, bob, timelineState) {
    // Merchant Garb
    ctx.fillStyle = timelineState === 3 ? '#e11d48' : (timelineState === 2 ? '#ea580c' : '#c2410c');
    ctx.fillRect(this.x - 11, this.y - 8 + bob, 22, 24);

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 14 + bob, 10, 0, Math.PI * 2);
    ctx.fill();

    // Dark Greek curls
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 21 + bob, 7, 0, Math.PI * 2);
    ctx.fill();

    if (timelineState === 3) {
      // Casino dealer visor
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(this.x - 8, this.y - 21 + bob, 16, 3);
    }
  }
}

// Master NPC Registry
window.npcs = [
  new NPC({
    id: 'socrates',
    name: 'Socrates',
    title: 'Gadfly of Athens',
    x: 150,
    y: 190,
    portraitEmoji: '👴'
  }),
  new NPC({
    id: 'archimedes',
    name: 'Archimedes',
    title: 'Master Geometer',
    x: 800,
    y: 190,
    portraitEmoji: '📐'
  }),
  new NPC({
    id: 'oracle',
    name: 'Oracle Kassandra',
    title: 'Delphic Seer',
    x: 150,
    y: 500,
    portraitEmoji: '🔮'
  }),
  new NPC({
    id: 'merchant',
    name: 'Merchant Nikos',
    title: 'Agora Trader',
    x: 800,
    y: 490,
    portraitEmoji: '🏺'
  })
];

window.player = new Player();
