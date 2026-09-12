/**
 * game.js - Master game loop, dynamic timeline switching,
 * stability simulation, anomaly tracking, Chrono-Shift warp, and multiple endings.
 */

class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.lastTime = 0;
    this.isRunning = false;

    // Timeline State (1: Canon, 2: Corrupted, 3: Cyber-Olympus)
    this.stability = 100;
    this.timelineState = 1;
    this.selectedTimeline = 1;

    // UI state
    this.isTimeTravelOpen = false;
    this.hasEnded = false;

    // Active nearby interaction target
    this.nearbyTarget = null; // { type: 'npc'|'item', obj: ... }

    // Input state
    this.keys = {};
  }

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    window.dialogueManager.init();

    // Initial stability and UI sync
    this.updateStabilityUI();
    this.updateObjectiveUI();
    this.updateMissionForTimeline();

    // ---------------------------------------------------------
    // Top Chrono-Shift Button
    // ---------------------------------------------------------
    const timeTravelBtn = document.getElementById('timeTravelBtn');
    if (timeTravelBtn) {
      timeTravelBtn.onclick = () => this.toggleTimeTravel();
    }

    // ---------------------------------------------------------
    // Quick Era Switcher Tabs on HUD
    // ---------------------------------------------------------
    const tab1 = document.getElementById('tabEra1');
    const tab2 = document.getElementById('tabEra2');
    const tab3 = document.getElementById('tabEra3');
    if (tab1) tab1.onclick = () => this.shiftToTimeline(1);
    if (tab2) tab2.onclick = () => this.shiftToTimeline(2);
    if (tab3) tab3.onclick = () => this.shiftToTimeline(3);

    // ---------------------------------------------------------
    // Chrono-Shift Modal Timeline Nodes
    // ---------------------------------------------------------
    this.bindTimelineNode('nodeCanon', 1);
    this.bindTimelineNode('nodeCorrupt', 2);
    this.bindTimelineNode('nodeRidiculous', 3);

    // ---------------------------------------------------------
    // Resume Mission Button in Chrono-Shift
    // ---------------------------------------------------------
    const resumeBtn = document.getElementById('exitTimeTravelBtn');
    if (resumeBtn) {
      resumeBtn.onclick = () => this.closeTimeTravel();
    }

    // ---------------------------------------------------------
    // Stabilize Timeline Button
    // ---------------------------------------------------------
    const stabilizeBtn = document.getElementById('stabilizeTimelineBtn');
    if (stabilizeBtn) {
      stabilizeBtn.onclick = () => this.attemptTemporalStabilization();
    }

    // ---------------------------------------------------------
    // Warp Home & Report Button
    // ---------------------------------------------------------
    const warpHomeBtn = document.getElementById('warpHomeBtn');
    if (warpHomeBtn) {
      warpHomeBtn.onclick = () => this.warpHomeAndSubmitReport();
    }

    // ---------------------------------------------------------
    // Restart Mission Button
    // ---------------------------------------------------------
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.onclick = () => this.restartGame();
    }

    // ---------------------------------------------------------
    // Help / Field Manual Modal
    // ---------------------------------------------------------
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    if (helpBtn && helpModal) {
      helpBtn.onclick = () => helpModal.classList.toggle('hidden');
    }
    if (closeHelpBtn && helpModal) {
      closeHelpBtn.onclick = () => helpModal.classList.add('hidden');
    }

    // ---------------------------------------------------------
    // Sound Toggle Button
    // ---------------------------------------------------------
    const audioBtn = document.getElementById('audioToggleBtn');
    if (audioBtn) {
      audioBtn.onclick = () => {
        const isMuted = !window.soundEngine.toggleMute();
        document.getElementById('audioStatus').textContent = isMuted ? 'OFF' : 'ON';
        document.getElementById('audioIcon').textContent = isMuted ? '🔇' : '🔊';
      };
    }

    // Start main game loop
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // =========================================================
  // CORE TIMELINE SHIFT (Changes World, Sound, UI, and Mechanics)
  // =========================================================

  shiftToTimeline(state) {
    if (state < 1 || state > 3) return;

    this.timelineState = state;
    this.selectedTimeline = state;

    // Set corresponding stability percentage
    if (state === 1) {
      this.stability = 95;
    } else if (state === 2) {
      this.stability = 55;
    } else {
      this.stability = 20;
    }

    // World floor, columns, signage transformation
    if (window.world && typeof window.world.setTimelineState === 'function') {
      window.world.setTimelineState(state);
    }

    // Procedural soundtrack transformation
    if (window.soundEngine) {
      window.soundEngine.setMusicState(state);
      window.soundEngine.playWhoosh();
    }

    // Dramatic visual glitch flash and particles
    this.triggerTimelineGlitchFlash();
    if (window.particleSystem) {
      window.particleSystem.triggerGlitchBurst(18);
    }

    // Update all UI gauges, tabs, and nodes
    this.updateStabilityUI();
    this.updateTimelineSelection();
    this.updateMissionForTimeline();
  }

  bindTimelineNode(id, state) {
    const node = document.getElementById(id);
    if (!node) return;

    node.onclick = (e) => {
      e.stopPropagation();
      this.shiftToTimeline(state);
    };
  }

  updateTimelineSelection() {
    const nodes = [
      { id: 'nodeCanon', state: 1 },
      { id: 'nodeCorrupt', state: 2 },
      { id: 'nodeRidiculous', state: 3 }
    ];

    nodes.forEach(({ id, state }) => {
      const node = document.getElementById(id);
      if (!node) return;

      const isCurrent = (this.timelineState === state);
      node.classList.toggle('active', isCurrent);
      node.classList.toggle('selected', isCurrent);
    });

    // Update deviation text in modal
    const devVal = document.getElementById('deviationVal');
    if (devVal) {
      if (this.timelineState === 1) {
        devVal.textContent = 'SAFE / BASELINE CANON';
      } else if (this.timelineState === 2) {
        devVal.textContent = 'MODERATE / ANACHRONISTIC DRIFT';
      } else {
        devVal.textContent = 'CRITICAL / CYBER-OLYMPUS CASCADE';
      }
    }
  }

  // =========================================================
  // CHRONO-SHIFT TIME TRAVEL MODAL
  // =========================================================

  openTimeTravel() {
    if (this.hasEnded) return;
    this.isTimeTravelOpen = true;

    const modal = document.getElementById('timeTravelModal');
    if (modal) {
      modal.classList.remove('hidden');
    }

    this.updateTimelineSelection();

    if (window.soundEngine) window.soundEngine.playWhoosh();
    if (window.particleSystem) window.particleSystem.triggerGlitchBurst(16);
  }

  closeTimeTravel() {
    this.isTimeTravelOpen = false;

    const modal = document.getElementById('timeTravelModal');
    if (modal) {
      modal.classList.add('hidden');
    }

    this.keys = {}; // Clear stuck keys
    if (window.soundEngine) window.soundEngine.playClick();
  }

  toggleTimeTravel() {
    if (this.isTimeTravelOpen) {
      this.closeTimeTravel();
    } else {
      this.openTimeTravel();
    }
  }

  // =========================================================
  // MISSION TEXT
  // =========================================================

  updateMissionForTimeline() {
    const mission = document.getElementById('missionDesc');
    if (!mission) return;

    if (this.timelineState === 1) {
      mission.textContent = 'BASELINE CANON: Retrieve all 3 futuristic anomalies before ancient Athens notices!';
    } else if (this.timelineState === 2) {
      mission.textContent = 'ANACHRONISTIC GLITCH: History is warping! Socrates is live-streaming. Recover the tech!';
    } else {
      mission.textContent = 'CYBER-OLYMPUS: Synthwave rave in 420 BC! DJ Socrates is dropping basslines. Embrace the chaos or repair reality!';
    }
  }

  // =========================================================
  // RESTART
  // =========================================================

  restartGame() {
    const ending = document.getElementById('endingModal');
    if (ending) ending.classList.add('hidden');

    this.hasEnded = false;
    this.isTimeTravelOpen = false;

    this.stability = 100;
    this.timelineState = 1;
    this.selectedTimeline = 1;

    // Reset items
    window.itemManager.reset();

    // Reset NPCs
    window.npcs.forEach(npc => {
      npc.holdingItem = null;
    });

    // Reset player position
    window.player.x = 480;
    window.player.y = 300;
    window.player.facing = 'down';

    // Reset world
    if (window.world && typeof window.world.setTimelineState === 'function') {
      window.world.setTimelineState(1);
    }

    this.updateStabilityUI();
    this.updateObjectiveUI();
    this.updateMissionForTimeline();
    this.updateTimelineSelection();

    if (window.soundEngine) {
      window.soundEngine.setMusicState(1);
      window.soundEngine.playSuccess();
    }
  }

  // =========================================================
  // STABILITY & CORRUPTION
  // =========================================================

  modifyStability(delta) {
    if (this.hasEnded) return;

    this.stability = Math.max(0, Math.min(100, this.stability + delta));

    // Automatically transition timeline state based on stability
    let newState = 1;
    if (this.stability < 35) {
      newState = 3;
    } else if (this.stability < 70) {
      newState = 2;
    } else {
      newState = 1;
    }

    if (newState !== this.timelineState) {
      this.timelineState = newState;
      this.selectedTimeline = newState;

      if (window.world) window.world.setTimelineState(newState);
      if (window.soundEngine) window.soundEngine.setMusicState(newState);
      this.triggerTimelineGlitchFlash();
    }

    this.updateStabilityUI();
    this.updateTimelineSelection();
    this.updateObjectiveUI();
    this.updateMissionForTimeline();

    this.checkEndings();
  }

  // =========================================================
  // HUD UI UPDATE
  // =========================================================

  updateStabilityUI() {
    const bar = document.getElementById('stabilityBar');
    const txt = document.getElementById('stabilityText');
    const stateLabel = document.getElementById('timelineStateLabel');
    const criticalInd = document.getElementById('criticalIndicator');
    const eraBadge = document.getElementById('eraLabel');

    if (!bar) return;

    bar.style.width = `${this.stability}%`;
    if (txt) txt.textContent = `${this.stability}%`;

    bar.className = 'stability-bar-fill';

    if (this.timelineState === 3 || this.stability < 35) {
      bar.classList.add('critical');
      if (criticalInd) criticalInd.style.display = 'block';
      if (stateLabel) {
        stateLabel.textContent = 'STATE: CYBER-OLYMPUS SYNTHWAVE';
        stateLabel.style.color = '#ff0077';
      }
      if (eraBadge) eraBadge.textContent = '420 BC // SYNTHWAVE MULTIVERSE';
    } else if (this.timelineState === 2 || this.stability < 70) {
      bar.classList.add('warning');
      if (criticalInd) criticalInd.style.display = 'none';
      if (stateLabel) {
        stateLabel.textContent = 'STATE: ANACHRONISTIC DISTORTION';
        stateLabel.style.color = '#ffaa00';
      }
      if (eraBadge) eraBadge.textContent = '420 BC // GLITCHED ATHENS';
    } else {
      if (criticalInd) criticalInd.style.display = 'none';
      if (stateLabel) {
        stateLabel.textContent = 'STATE: BASELINE CANON';
        stateLabel.style.color = '#00f0ff';
      }
      if (eraBadge) eraBadge.textContent = '420 BC // ATHENS AGORA';
    }

    // Update top HUD tabs
    const tab1 = document.getElementById('tabEra1');
    const tab2 = document.getElementById('tabEra2');
    const tab3 = document.getElementById('tabEra3');
    if (tab1) tab1.classList.toggle('active', this.timelineState === 1);
    if (tab2) tab2.classList.toggle('active', this.timelineState === 2);
    if (tab3) tab3.classList.toggle('active', this.timelineState === 3);

    // Update Paradox numbers
    const paradoxVal = document.getElementById('paradoxIndexVal');
    if (paradoxVal) {
      const paradoxons = ((100 - this.stability) * 1.42).toFixed(1);
      paradoxVal.textContent = `${paradoxons} PARADOXONS`;
    }
  }

  // =========================================================
  // OBJECTIVES TRACKER
  // =========================================================

  updateObjectiveUI() {
    const list = document.getElementById('anomalyList');
    const counter = document.getElementById('anomalyCounter');
    if (!list || !counter) return;

    const contrabandIds = ['phone', 'drink', 'laser'];
    let securedCount = 0;

    list.innerHTML = '';
    contrabandIds.forEach(id => {
      const item = window.itemManager.groundItems.find(i => i.id === id);
      if (!item) return;

      const isSecured = window.itemManager.hasItem(id);
      const holdingNpc = window.npcs.find(n => n.holdingItem && n.holdingItem.id === id);

      const li = document.createElement('li');
      li.className = 'anomaly-item' + (isSecured ? ' resolved' : '');

      let statusDesc = 'ON AGORA FLOOR';
      if (isSecured) {
        statusDesc = 'CONTAINED IN SUIT';
        securedCount++;
      } else if (holdingNpc) {
        statusDesc = `HELD BY ${holdingNpc.name.toUpperCase()}!`;
      }

      li.innerHTML = `
        <span class="anomaly-icon">${isSecured ? '✔️' : '⚠️'}</span>
        <span><strong>${item.name}</strong> - ${statusDesc}</span>
      `;
      list.appendChild(li);
    });

    const remaining = 3 - securedCount;
    counter.textContent = remaining === 0 ? 'ALL ANOMALIES SECURED!' : `${remaining} LEAKS ACTIVE`;
    counter.style.color = remaining === 0 ? '#00ffaa' : '#ffaa00';
  }

  // =========================================================
  // TEMPORAL STABILIZER
  // =========================================================

  attemptTemporalStabilization() {
    if (window.soundEngine) window.soundEngine.playWhoosh();
    if (window.particleSystem) window.particleSystem.triggerGlitchBurst(20);

    if (this.stability < 80) {
      this.modifyStability(20);
      alert('Temporal stabilizer pulse dispatched! +20% timeline stability restored.');
    } else {
      alert('Chronofield is already calibrated! Recover physical contraband items to reach 100% canon.');
    }

    this.closeTimeTravel();
  }

  // =========================================================
  // WARP HOME & FINAL MISSION REPORT
  // =========================================================

  warpHomeAndSubmitReport() {
    if (window.soundEngine) window.soundEngine.playWhoosh();
    if (window.particleSystem) window.particleSystem.triggerGlitchBurst(24);

    this.closeTimeTravel();

    const hasPhone = window.itemManager.hasItem('phone');
    const hasDrink = window.itemManager.hasItem('drink');
    const hasLaser = window.itemManager.hasItem('laser');
    const securedTotal = (hasPhone ? 1 : 0) + (hasDrink ? 1 : 0) + (hasLaser ? 1 : 0);

    // ---------------------------------------------------------
    // RANK F - Collapse
    // ---------------------------------------------------------
    if (this.stability <= 0) {
      this.triggerEnding(
        'RANK F',
        'CHRONO-COLLAPSE (TOTAL PARADOX)',
        'Reality folded into a 4D quantum singularity.',
        [
          ['TIMELINE STABILITY', '0% [CRITICAL DISASTER]'],
          ['ANOMALIES RESOLVED', `${securedTotal} / 3 SECURED`],
          ['OUTCOME', 'Agent Chrono trapped in eternal loop of Socrates reviewing TikTok hemlock videos.'],
          ['EVALUATION', 'TIMELINE TERMINATED. PLEASE AVOID TIME MACHINES IN FUTURE.']
        ],
        'rank-f'
      );
      return;
    }

    // ---------------------------------------------------------
    // RANK B - Cyber-Olympus
    // ---------------------------------------------------------
    if (this.timelineState === 3 || this.stability < 35) {
      this.triggerEnding(
        'RANK B',
        'CYBER-OLYMPUS RAVE ASCENDANCY',
        'You broke history with style! Ancient Greece became a neon synthwave galactic empire.',
        [
          ['TIMELINE STABILITY', `${this.stability}% [HYPER-STABLE MULTIVERSE]`],
          ['ANOMALIES RESOLVED', `${securedTotal} / 3 DISPERSED TO LOCALS`],
          ['OUTCOME', 'Athens constructs laser dreadnoughts in 300 BC. DJ Socrates is supreme galactic philosopher!'],
          ['EVALUATION', 'ILLEGAL. ABSURD. UNRIVALED SWAG!']
        ],
        'rank-b'
      );
      return;
    }

    // ---------------------------------------------------------
    // RANK S - Pristine Canon
    // ---------------------------------------------------------
    if (securedTotal === 3 && this.stability >= 80) {
      this.triggerEnding(
        'RANK S',
        'MASTER CHRONOGUARD (PRISTINE CANON)',
        'All 24th-century temporal contraband safely recovered. Classical history preserved unaltered.',
        [
          ['TIMELINE STABILITY', `${this.stability}% [MAXIMUM EQUILIBRIUM]`],
          ['ANOMALIES RESOLVED', '3 / 3 FULLY CONTAINED'],
          ['HISTORICAL INTEGRITY', 'Socrates drinks herbal tea, Archimedes sketches circles in sand, no cyber-wars.'],
          ['PROMOTION', 'PROMOTED TO SENIOR TEMPORAL INQUISITOR!']
        ],
        'rank-s'
      );
      return;
    }

    // ---------------------------------------------------------
    // RANK A - Sage's Calculator
    // ---------------------------------------------------------
    if (securedTotal >= 2 && this.stability >= 50) {
      this.triggerEnding(
        'RANK A',
        "THE SAGE'S POCKET CALCULATOR",
        'You mostly repaired history, though a curious future gadget remained in Athens.',
        [
          ['TIMELINE STABILITY', `${this.stability}% [STABLE QUIRK]`],
          ['ANOMALIES RESOLVED', `${securedTotal} / 3 CONTAINED`],
          ['OUTCOME', 'Socrates is mysteriously remembered as the ancient father of touchscreen logic.'],
          ['EVALUATION', 'ACCEPTABLE TOLERANCE. MISSION PASSED WITH MINOR ANOMALY NOTE.']
        ],
        'rank-s'
      );
      return;
    }

    // ---------------------------------------------------------
    // RANK C - Early Extraction
    // ---------------------------------------------------------
    this.triggerEnding(
      'RANK C',
      'EARLY TEMPORAL EXTRACTION',
      'You returned to the 24th century before completing anomaly containment.',
      [
        ['TIMELINE STABILITY', `${this.stability}% [UNSTABLE JITTER]`],
        ['ANOMALIES RESOLVED', `${securedTotal} / 3 CONTAINED`],
        ['OUTCOME', 'Archimedes patented a laser toaster. The timeline is mildly confused.'],
        ['EVALUATION', 'MISSION INCOMPLETE. AGENT CHRONO REPRIMANDED.']
      ],
      'rank-b'
    );
  }

  // =========================================================
  // ENDING TRIGGER
  // =========================================================

  checkEndings() {
    if (this.hasEnded) return;

    if (this.stability <= 0) {
      this.warpHomeAndSubmitReport();
    }
  }

  triggerEnding(rank, title, tagline, rows, badgeClass) {
    this.hasEnded = true;

    const modal = document.getElementById('endingModal');
    const badge = document.getElementById('endingBadge');
    const titleEl = document.getElementById('endingTitle');
    const tagEl = document.getElementById('endingTagline');
    const report = document.getElementById('endingReport');

    if (!modal) return;

    if (badge) {
      badge.className = `ending-badge ${badgeClass}`;
      badge.textContent = rank;
    }
    if (titleEl) titleEl.textContent = title;
    if (tagEl) tagEl.textContent = tagline;

    if (report) {
      report.innerHTML = '';
      rows.forEach(([k, v]) => {
        const row = document.createElement('div');
        row.className = 'report-row';
        row.innerHTML = `<span style="color:#8bbdd8">${k}:</span><strong>${v}</strong>`;
        report.appendChild(row);
      });
    }

    modal.classList.remove('hidden');

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.particleSystem) window.particleSystem.spawnCelebrationSparks(480, 260);
  }

  // =========================================================
  // INTERACTION
  // =========================================================

  handleInteract() {
    if (window.dialogueManager && window.dialogueManager.isOpen) {
      return;
    }

    if (!this.nearbyTarget) return;

    if (this.nearbyTarget.type === 'item') {
      const item = this.nearbyTarget.obj;
      const picked = window.itemManager.pickupItem(item);

      if (picked) {
        this.updateObjectiveUI();
        this.modifyStability(5);

        const allSecured =
          window.itemManager.hasItem('phone') &&
          window.itemManager.hasItem('drink') &&
          window.itemManager.hasItem('laser');

        if (allSecured) {
          alert('ALL 3 ANOMALIES SECURED! Open CHRONO-SHIFT (SPACE) or Warp Home to submit your mission report!');
        }
      }
    } else if (this.nearbyTarget.type === 'npc') {
      const npc = this.nearbyTarget.obj;
      window.dialogueManager.open(npc);
    }
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(dt) {
    if (this.hasEnded) return;

    if (!window.dialogueManager.isOpen && !this.isTimeTravelOpen) {
      window.player.update(dt, this.keys, window.world);
    }

    window.world.update(dt);
    window.particleSystem.update(dt);

    this.checkNearbyInteractables();
  }

  // =========================================================
  // NEARBY OBJECT DETECTION
  // =========================================================

  checkNearbyInteractables() {
    const px = window.player.x;
    const py = window.player.y;
    const prompt = document.getElementById('interactPrompt');
    const promptText = document.getElementById('promptText');

    if (!prompt || !promptText) return;

    if (window.dialogueManager.isOpen || this.isTimeTravelOpen) {
      prompt.classList.add('hidden');
      this.nearbyTarget = null;
      return;
    }

    // Ground Item check
    const groundItem = window.itemManager.findNearbyGroundItem(px, py, 36);
    if (groundItem) {
      this.nearbyTarget = { type: 'item', obj: groundItem };
      promptText.textContent = `Pick up ${groundItem.name}`;
      prompt.classList.remove('hidden');
      return;
    }

    // NPC check
    let nearbyNpc = null;
    for (const npc of window.npcs) {
      if (npc.isNear(px, py, 50)) {
        nearbyNpc = npc;
        break;
      }
    }

    if (nearbyNpc) {
      this.nearbyTarget = { type: 'npc', obj: nearbyNpc };
      promptText.textContent = `Talk to ${nearbyNpc.name}`;
      prompt.classList.remove('hidden');
      return;
    }

    this.nearbyTarget = null;
    prompt.classList.add('hidden');
  }

  // =========================================================
  // SCREEN GLITCH FLASH
  // =========================================================

  triggerTimelineGlitchFlash() {
    const flash = document.getElementById('glitchFlash');
    if (!flash) return;

    flash.classList.add('flash-active');
    setTimeout(() => {
      flash.classList.remove('flash-active');
    }, 180);
  }

  // =========================================================
  // RENDER
  // =========================================================

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. World Floor & Structures
    window.world.render(this.ctx);

    // 2. Ground Items
    window.itemManager.renderGroundItems(this.ctx, window.world.time);

    // 3. Y-sorted Entity Rendering (Player & NPCs)
    const entities = [window.player, ...window.npcs];
    entities.sort((a, b) => a.y - b.y);

    for (const entity of entities) {
      if (entity === window.player) {
        window.player.render(this.ctx);
      } else {
        entity.render(this.ctx, window.world.time, this.timelineState);
      }
    }

    // 4. Particles
    window.particleSystem.render(this.ctx);
  }

  // =========================================================
  // GAME LOOP
  // =========================================================

  gameLoop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    if (this.isRunning) {
      requestAnimationFrame((t) => this.gameLoop(t));
    }
  }
}

window.game = new Game();