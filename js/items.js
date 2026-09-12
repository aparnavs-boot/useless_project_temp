/**
 * items.js - Contraband anomalies & authentic period artifacts,
 * ground rendering, inventory management, and hotbar integration.
 */
class ItemManager {
  constructor() {
    // Master item catalog
    this.groundItems = [
      // Initially, 2 contraband items lie near rifts or tables, and 1 has already been picked up or traded!
      {
        id: 'phone',
        name: 'Quantum Smartphone',
        icon: '📱',
        desc: 'iChronos 4000 with 6G and holographic camera. Ancient Greeks find it utterly hypnotic.',
        isContraband: true,
        x: 320,
        y: 200,
        inInventory: false,
        auraColor: '#00f0ff'
      },
      {
        id: 'drink',
        name: 'CyberBull Energy Drink',
        icon: '⚡',
        desc: 'Contains 800mg synthetic caffeine and glowing nanobots. Gives 10x thinking speed.',
        isContraband: true,
        x: 620,
        y: 230,
        inInventory: false,
        auraColor: '#00ffaa'
      },
      {
        id: 'laser',
        name: 'Plasma Laser Cutter',
        icon: '🔫',
        desc: 'Industrial 24th-century hand cutter. Cuts through marble like butter.',
        isContraband: true,
        x: 500,
        y: 420,
        inInventory: false,
        auraColor: '#ff0077'
      },
      // Period Authentic Artifacts (harmless historical replacements)
      {
        id: 'scroll',
        name: 'Philosophical Scroll',
        icon: '📜',
        desc: 'Ancient papyrus manuscript discussing virtue, dialectics, and moderate tea consumption.',
        isContraband: false,
        x: 210,
        y: 220,
        inInventory: false,
        auraColor: '#d4af37'
      },
      {
        id: 'gear',
        name: 'Brass Sundial Gear',
        icon: '⚙️',
        desc: 'Exquisitely crafted Antikythera-style astronomical gear for Archimedes.',
        isContraband: false,
        x: 820,
        y: 220,
        inInventory: false,
        auraColor: '#e0a96d'
      },
      {
        id: 'amphora',
        name: 'Aged Olive Oil Amphora',
        icon: '🏺',
        desc: 'First-press extra virgin olive oil from the sacred groves of Athena.',
        isContraband: false,
        x: 680,
        y: 480,
        inInventory: false,
        auraColor: '#c29b38'
      }
    ];

    this.inventory = [];
    this.maxInventorySize = 6;
    this.selectedIndex = 0;
  }

  reset() {
    this.groundItems.forEach(item => {
      item.inInventory = false;
    });
    // Reset positions
    this.groundItems[0].x = 320; this.groundItems[0].y = 200;
    this.groundItems[1].x = 620; this.groundItems[1].y = 230;
    this.groundItems[2].x = 500; this.groundItems[2].y = 420;
    this.groundItems[3].x = 210; this.groundItems[3].y = 220;
    this.groundItems[4].x = 820; this.groundItems[4].y = 220;
    this.groundItems[5].x = 680; this.groundItems[5].y = 480;

    this.inventory = [];
    this.selectedIndex = 0;
    this.updateInventoryUI();
  }

  // Find ground item within radius of player
  findNearbyGroundItem(px, py, radius = 38) {
    for (let i = 0; i < this.groundItems.length; i++) {
      const item = this.groundItems[i];
      if (!item.inInventory) {
        const dx = px - item.x;
        const dy = py - item.y;
        if (dx * dx + dy * dy < radius * radius) {
          return item;
        }
      }
    }
    return null;
  }

  pickupItem(item) {
    if (this.inventory.length >= this.maxInventorySize) {
      alert("Inventory is full! Use or drop an item.");
      return false;
    }
    item.inInventory = true;
    this.inventory.push(item);
    window.soundEngine.playPickup();
    this.updateInventoryUI();
    return true;
  }

  dropSelectedItem(px, py) {
    if (this.inventory.length === 0) return null;
    const item = this.inventory[this.selectedIndex];
    if (!item) return null;

    item.inInventory = false;
    item.x = px + 20;
    item.y = py + 20;

    this.inventory.splice(this.selectedIndex, 1);
    if (this.selectedIndex >= this.inventory.length) {
      this.selectedIndex = Math.max(0, this.inventory.length - 1);
    }
    window.soundEngine.playClick();
    this.updateInventoryUI();
    return item;
  }

  hasItem(itemId) {
    return this.inventory.some(item => item.id === itemId);
  }

  removeItem(itemId) {
    const idx = this.inventory.findIndex(item => item.id === itemId);
    if (idx !== -1) {
      const removed = this.inventory.splice(idx, 1)[0];
      if (this.selectedIndex >= this.inventory.length) {
        this.selectedIndex = Math.max(0, this.inventory.length - 1);
      }
      this.updateInventoryUI();
      return removed;
    }
    return null;
  }

  getSelectedItem() {
    return this.inventory[this.selectedIndex] || null;
  }

  selectIndex(index) {
    if (index >= 0 && index < this.inventory.length) {
      this.selectedIndex = index;
      window.soundEngine.playClick();
      this.updateInventoryUI();
    }
  }

  updateInventoryUI() {
    const container = document.getElementById('inventorySlots');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < this.maxInventorySize; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot' + (i === this.selectedIndex ? ' active-selected' : '');
      slot.onclick = () => this.selectIndex(i);

      const slotIdx = document.createElement('span');
      slotIdx.className = 'slot-index';
      slotIdx.textContent = (i + 1);
      slot.appendChild(slotIdx);

      const item = this.inventory[i];
      if (item) {
        slot.title = `${item.name}: ${item.desc}`;
        const icon = document.createElement('span');
        icon.className = 'slot-icon';
        icon.textContent = item.icon;
        slot.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'slot-name';
        name.textContent = item.name.split(' ')[0];
        slot.appendChild(name);
      }

      container.appendChild(slot);
    }
  }

  renderGroundItems(ctx, time) {
    ctx.save();
    for (const item of this.groundItems) {
      if (!item.inInventory) {
        // Floating animation
        const floatY = item.y + Math.sin(time * 4 + item.x) * 4;

        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(item.x, item.y + 12, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Holographic aura ring
        ctx.strokeStyle = item.auraColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(item.x, floatY, 16, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing glow fill
        ctx.fillStyle = item.auraColor;
        ctx.globalAlpha = 0.2 + 0.15 * Math.sin(time * 5);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Render emoji / sprite icon
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, item.x, floatY);

        // Render contraband hazard indicator
        if (item.isContraband) {
          ctx.fillStyle = '#ff0077';
          ctx.font = 'bold 9px Orbitron';
          ctx.fillText('ANOMALY', item.x, floatY - 20);
        }
      }
    }
    ctx.restore();
  }
}

window.itemManager = new ItemManager();
