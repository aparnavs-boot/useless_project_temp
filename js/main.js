/**
 * main.js - Entry point, input listeners (WASD, keys 1-6, Space, E, Q),
 * user gesture audio initialization, and canvas click support.
 */

window.addEventListener('DOMContentLoaded', () => {
  // Initialize game systems
  window.itemManager.updateInventoryUI();
  window.game.init();

  // Audio gesture initialization
  const initAudioOnFirstGesture = () => {
    window.soundEngine.init();
    window.soundEngine.resume();
    window.removeEventListener('click', initAudioOnFirstGesture);
    window.removeEventListener('keydown', initAudioOnFirstGesture);
  };
  window.addEventListener('click', initAudioOnFirstGesture);
  window.addEventListener('keydown', initAudioOnFirstGesture);

  // Keyboard Event Listeners
  window.addEventListener('keydown', (e) => {
    window.game.keys[e.code] = true;

    // Hotkey: E (Interact)
    if (e.code === 'KeyE') {
      window.game.handleInteract();
    }

    // Hotkey: Space (Chrono-Shift Vortex)
    if (e.code === 'Space') {
      // Don't jump if typing in input or inside dialogue choice
      if (!window.dialogueManager.isOpen) {
        e.preventDefault();
        window.game.toggleTimeTravel();
      }
    }

    // Hotkey: Q (Drop selected inventory item onto ground)
    if (e.code === 'KeyQ') {
      const dropped = window.itemManager.dropSelectedItem(window.player.x, window.player.y);
      if (dropped) {
        window.game.updateObjectiveUI();
      }
    }

    // Hotkey: 1 - 6 (Inventory Select)
    if (e.code.startsWith('Digit')) {
      const num = parseInt(e.code.replace('Digit', ''), 10);
      if (num >= 1 && num <= 6) {
        window.itemManager.selectIndex(num - 1);
      }
    }

    // Hotkey: M (Toggle Mute)
    if (e.code === 'KeyM') {
      const isMuted = !window.soundEngine.toggleMute();
      document.getElementById('audioStatus').textContent = isMuted ? 'OFF' : 'ON';
      document.getElementById('audioIcon').textContent = isMuted ? '🔇' : '🔊';
    }

    // Hotkey: H (Toggle Handbook)
    if (e.code === 'KeyH') {
      const helpModal = document.getElementById('helpModal');
      if (helpModal) helpModal.classList.toggle('hidden');
    }

    // Hotkey: Escape (Close any open modal)
    if (e.code === 'Escape') {
      if (window.dialogueManager.isOpen) {
        window.dialogueManager.close();
      } else if (window.game.isTimeTravelOpen) {
        window.game.toggleTimeTravel();
      } else {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) helpModal.classList.add('hidden');
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    window.game.keys[e.code] = false;
  });

  // Click on Canvas to interact or move
  const canvas = document.getElementById('gameCanvas');
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked near ground item or NPC
    for (const npc of window.npcs) {
      const dx = clickX - npc.x;
      const dy = clickY - npc.y;
      if (dx * dx + dy * dy < 35 * 35) {
        if (npc.isNear(window.player.x, window.player.y, 65)) {
          window.dialogueManager.open(npc);
          return;
        }
      }
    }

    // If interact prompt is visible and clicked
    if (window.game.nearbyTarget) {
      window.game.handleInteract();
    }
  });

  // Click on interact prompt overlay directly
  const promptEl = document.getElementById('interactPrompt');
  if (promptEl) {
    promptEl.addEventListener('click', () => {
      window.game.handleInteract();
    });
  }
});
