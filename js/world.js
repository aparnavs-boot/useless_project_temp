/**
 * world.js - Athens Agora map renderer, tile grids, collision barriers,
 * and 3 dynamic visual timeline states.
 */
class World {
  constructor(width = 960, height = 600) {
    this.width = width;
    this.height = height;
    this.timelineState = 1; // 1: Normal, 2: Corrupted, 3: Ridiculous
    this.time = 0;

    // Obstacles / Colliders: [x, y, w, h, type]
    this.colliders = [
      // Outer boundaries
      { x: 0, y: 0, w: width, h: 48, type: 'wall' },
      { x: 0, y: height - 20, w: width, h: 20, type: 'wall' },
      { x: 0, y: 0, w: 20, h: height, type: 'wall' },
      { x: width - 20, y: 0, w: 20, h: height, type: 'wall' },

      // Top-Left: Socrates's Philosopher Colonnade
      { x: 80, y: 80, w: 32, h: 64, type: 'column' },
      { x: 190, y: 80, w: 32, h: 64, type: 'column' },
      { x: 110, y: 150, w: 80, h: 28, type: 'bench' },

      // Top-Right: Archimedes's Workshop / Forge
      { x: 740, y: 80, w: 32, h: 64, type: 'column' },
      { x: 850, y: 80, w: 32, h: 64, type: 'column' },
      { x: 750, y: 150, w: 90, h: 32, type: 'table' },

      // Bottom-Left: Oracle Shrine
      { x: 80, y: 440, w: 32, h: 64, type: 'column' },
      { x: 180, y: 440, w: 32, h: 64, type: 'column' },
      { x: 115, y: 430, w: 40, h: 40, type: 'altar' },

      // Bottom-Right: Merchant Bazaar
      { x: 740, y: 440, w: 32, h: 64, type: 'column' },
      { x: 850, y: 440, w: 32, h: 64, type: 'column' },
      { x: 730, y: 420, w: 110, h: 36, type: 'stall' },
    ];
  }

  setTimelineState(state) {
    this.timelineState = state;
  }

  update(dt) {
    this.time += dt;
  }

  // Check collision with bounding box
  checkCollision(x, y, radius = 14) {
    for (const c of this.colliders) {
      // Circle to AABB collision
      const closestX = Math.max(c.x, Math.min(x, c.x + c.w));
      const closestY = Math.max(c.y, Math.min(y, c.y + c.h));
      const dx = x - closestX;
      const dy = y - closestY;
      if (dx * dx + dy * dy < radius * radius) {
        return true; // Collision detected
      }
    }
    return false;
  }

  render(ctx) {
    // 1. Base Floor Rendering
    if (this.timelineState === 1) {
      this.renderClassicalFloor(ctx);
    } else if (this.timelineState === 2) {
      this.renderGlitchedFloor(ctx);
    } else {
      this.renderSynthwaveFloor(ctx);
    }

    // 2. Center Rift / Mosaic
    this.renderCenterRift(ctx);

    // 3. Decor and Structures
    this.renderZones(ctx);

    // 4. Columns & Props
    this.renderProps(ctx);
  }

  /* ---------------- Floor Styles ---------------- */
  renderClassicalFloor(ctx) {
    // Warm sunlit Mediterranean stone
    ctx.fillStyle = '#1c1c24';
    ctx.fillRect(0, 0, this.width, this.height);

    // Stone tile grid pattern
    const tileSize = 60;
    ctx.strokeStyle = 'rgba(180, 160, 130, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += tileSize) {
      for (let y = 0; y < this.height; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Greek key border at top
    ctx.fillStyle = 'rgba(218, 165, 32, 0.15)';
    ctx.fillRect(0, 48, this.width, 6);
  }

  renderGlitchedFloor(ctx) {
    // Darker, with glowing cyan circuitry lines
    ctx.fillStyle = '#101420';
    ctx.fillRect(0, 0, this.width, this.height);

    const tileSize = 60;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += tileSize) {
      for (let y = 0; y < this.height; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Glitchy Ethernet cables running between zones
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(140, 140);
    ctx.lineTo(480, 300);
    ctx.lineTo(790, 160);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 0, 119, 0.5)';
    ctx.beginPath();
    ctx.moveTo(130, 450);
    ctx.lineTo(480, 300);
    ctx.lineTo(780, 440);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  renderSynthwaveFloor(ctx) {
    // Deep neon retro synthwave grid
    ctx.fillStyle = '#0a0518';
    ctx.fillRect(0, 0, this.width, this.height);

    // Dynamic pulsating grid lines
    const gridGlow = 0.25 + 0.15 * Math.sin(this.time * 5);
    ctx.strokeStyle = `rgba(255, 0, 119, ${gridGlow})`;
    ctx.lineWidth = 1.5;

    const tileSize = 48;
    const offset = (this.time * 20) % tileSize;
    for (let x = 0; x < this.width; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = offset; y < this.height; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Neon Greek Holograms on ground
    ctx.font = '24px Orbitron';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.fillText('⚡ CYBER AGORA ⚡', 360, 100);
  }

  /* ---------------- Center Rift ---------------- */
  renderCenterRift(ctx) {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Outer ancient mosaic medallion
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fillStyle = this.timelineState === 3 ? 'rgba(255, 0, 119, 0.15)' : 'rgba(0, 240, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = this.timelineState === 3 ? 'rgba(255, 0, 119, 0.6)' : 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Swirling temporal rift fissure
    const pulse = Math.sin(this.time * 3);
    const riftRadius = 24 + pulse * 4;

    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, riftRadius * 1.6);
    if (this.timelineState === 1) {
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
      grad.addColorStop(0.5, 'rgba(0, 255, 170, 0.4)');
      grad.addColorStop(1, 'transparent');
    } else if (this.timelineState === 2) {
      grad.addColorStop(0, 'rgba(255, 170, 0, 0.9)');
      grad.addColorStop(0.6, 'rgba(0, 240, 255, 0.5)');
      grad.addColorStop(1, 'transparent');
    } else {
      grad.addColorStop(0, 'rgba(255, 0, 119, 0.95)');
      grad.addColorStop(0.5, 'rgba(157, 78, 221, 0.7)');
      grad.addColorStop(1, 'transparent');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, riftRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Rift crack lines
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 10 + pulse * 2);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + 18, cy + 12 - pulse * 2);
    ctx.stroke();

    ctx.restore();

    // Spawn ambient chronon particles at rift
    if (Math.random() < 0.3) {
      const color = this.timelineState === 3 ? '#ff0077' : '#00f0ff';
      window.particleSystem.spawnRiftPulse(cx, cy, color);
    }
  }

  /* ---------------- Zone Decor ---------------- */
  renderZones(ctx) {
    ctx.save();
    ctx.font = '11px Share Tech Mono';
    ctx.fillStyle = 'rgba(140, 190, 220, 0.6)';

    // Zone 1: Socrates Corner
    ctx.fillText('PHILOSOPHER PORTICO', 75, 70);
    // Zone 2: Archimedes Forge
    ctx.fillText('ARCHIMEDES WORKSHOP', 730, 70);
    // Zone 3: Delphi Shrine
    ctx.fillText('ORACLE OF DELPHI', 80, 430);
    // Zone 4: Market Bazaar
    ctx.fillText('AGORA BAZAAR', 740, 410);

    // State 3 Extra Neon Signage
    if (this.timelineState === 3) {
      ctx.fillStyle = '#ff0077';
      ctx.font = 'bold 12px Orbitron';
      ctx.fillText('🎧 DJ SOCRATES BOOTH', 65, 55);
      ctx.fillText('🚀 LASER CANNON R&D', 730, 55);
      ctx.fillText('🤖 ORACLE-GPT 9000', 80, 415);
      ctx.fillText('🎰 CRYPTO BAZAAR', 740, 395);
    }

    ctx.restore();
  }

  /* ---------------- Columns & Props ---------------- */
  renderProps(ctx) {
    for (const c of this.colliders) {
      if (c.type === 'column') {
        this.renderColumn(ctx, c.x, c.y, c.w, c.h);
      } else if (c.type === 'bench') {
        this.renderBench(ctx, c.x, c.y, c.w, c.h);
      } else if (c.type === 'table') {
        this.renderTable(ctx, c.x, c.y, c.w, c.h);
      } else if (c.type === 'altar') {
        this.renderAltar(ctx, c.x, c.y, c.w, c.h);
      } else if (c.type === 'stall') {
        this.renderStall(ctx, c.x, c.y, c.w, c.h);
      }
    }
  }

  renderColumn(ctx, x, y, w, h) {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 4, w / 2 + 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Column body
    if (this.timelineState === 1) {
      // Classical White Marble
      ctx.fillStyle = '#e8e5dc';
      ctx.fillRect(x + 4, y + 8, w - 8, h - 16);
      // Capital & Base
      ctx.fillStyle = '#d4cfc3';
      ctx.fillRect(x, y, w, 8);
      ctx.fillRect(x, y + h - 8, w, 8);
      // Fluting lines
      ctx.strokeStyle = '#c4beb0';
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 8);
      ctx.lineTo(x + 10, y + h - 8);
      ctx.moveTo(x + w - 10, y + 8);
      ctx.lineTo(x + w - 10, y + h - 8);
      ctx.stroke();
    } else if (this.timelineState === 2) {
      // Glitched Column with Wrapped Cables
      ctx.fillStyle = '#3a4454';
      ctx.fillRect(x + 4, y + 8, w - 8, h - 16);
      ctx.fillStyle = '#222b38';
      ctx.fillRect(x, y, w, 8);
      ctx.fillRect(x, y + h - 8, w, 8);
      // Wrapped cyan glow cable
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 16);
      ctx.lineTo(x + w - 4, y + 26);
      ctx.lineTo(x + 4, y + 36);
      ctx.lineTo(x + w - 4, y + 46);
      ctx.stroke();
    } else {
      // Synthwave Neon Equalizer Pillar!
      const beat = Math.abs(Math.sin(this.time * 6 + x));
      const barH = (h - 16) * (0.3 + 0.7 * beat);
      ctx.fillStyle = '#110524';
      ctx.fillRect(x + 4, y + 8, w - 8, h - 16);
      ctx.fillStyle = '#ff0077';
      ctx.fillRect(x + 4, y + h - 8 - barH, w - 8, barH);
      ctx.strokeStyle = '#00f0ff';
      ctx.strokeRect(x, y, w, h);
    }
    ctx.restore();
  }

  renderBench(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = this.timelineState === 3 ? '#9d4edd' : '#b8b2a3';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#444';
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }

  renderTable(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = this.timelineState === 3 ? '#220044' : '#8c6239';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = this.timelineState === 3 ? '#00f0ff' : '#5c3e21';
    ctx.strokeRect(x, y, w, h);
    // Gear blueprint on table
    ctx.strokeStyle = this.timelineState === 3 ? '#ff0077' : '#d4af37';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  renderAltar(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = this.timelineState === 3 ? '#4a0e4e' : '#4a5568';
    ctx.fillRect(x, y, w, h);
    // Fire / holographic emitter
    const flameY = y + 10 + Math.sin(this.time * 8) * 3;
    ctx.fillStyle = this.timelineState === 3 ? '#ff0077' : '#ff9900';
    ctx.beginPath();
    ctx.arc(x + w / 2, flameY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderStall(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = this.timelineState === 3 ? '#ff0077' : '#d97706';
    ctx.fillRect(x, y, w, 12);
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(x + 4, y + 12, w - 8, h - 12);
    ctx.restore();
  }
}

window.world = new World();
