/**
 * dialogue.js - Dynamic branching conversation engine with typewriter effect,
 * multi-era reactivity, item offering, and comedic timeline lore.
 */

class DialogueManager {
  constructor() {
    this.isOpen = false;
    this.currentNpc = null;
    this.typewriterTimer = null;
    this.fullText = '';
    this.charIndex = 0;
    this.modal = null;
    this.dialogueTextEl = null;
    this.choicesContainer = null;
    this.portraitEl = null;
    this.nameEl = null;
    this.titleEl = null;
  }

  init() {
    this.modal = document.getElementById('dialogueModal');
    this.dialogueTextEl = document.getElementById('dialogueText');
    this.choicesContainer = document.getElementById('dialogueChoices');
    this.portraitEl = document.getElementById('npcPortrait');
    this.nameEl = document.getElementById('npcName');
    this.titleEl = document.getElementById('npcTitle');

    const closeBtn = document.getElementById('closeDialogueBtn');
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }
  }

  open(npc) {
    this.currentNpc = npc;
    this.isOpen = true;
    this.modal.classList.remove('hidden');

    this.nameEl.textContent = npc.name;
    this.titleEl.textContent = npc.title;
    this.portraitEl.textContent = npc.portraitEmoji;

    window.soundEngine.playClick();
    this.renderCurrentNode();
  }

  close() {
    this.isOpen = false;
    this.modal.classList.add('hidden');
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    window.soundEngine.playClick();
  }

  renderCurrentNode() {
    const timelineState = window.game.timelineState;
    const npc = this.currentNpc;

    // Determine dialogue content based on NPC, held item, and timeline state
    let text = "";
    let choices = [];

    if (npc.id === 'socrates') {
      if (npc.holdingItem && npc.holdingItem.id === 'phone') {
        text = "By the gods! This glowing black slate told me I have 4,200 'followers'! Are they walking behind me? Where are they? Also, someone named @Xenophon posted a video of a dancing dog. I cannot look away from the infinite scroll!";
        choices = [
          { text: "Take back the Quantum Smartphone", action: () => this.confiscateItem(npc) },
          { text: "Offer another item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Tell him to check his notifications", isHazard: true, action: () => this.encourageCorruption("Socrates starts live-streaming his trial on TikTok!") }
        ];
      } else if (timelineState === 3) {
        text = "DROP THE BASS, ATHENS! You claim you know something? You know NOTHING! Except that this synthwave drop is 140 BPM pure divine fire! *[holographic laser horn sounds]*";
        choices = [
          { text: "Socrates, please, philosophy was about logic!", action: () => this.speak("Logic?! My dubstep bass drops have dismantled all Athenian dogmatism! Listen to the sub-bass of TRUTH!") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Dance to the Socratic drop", isHazard: true, action: () => this.encourageCorruption("You vibe with DJ Socrates. Reality trembles with sub-bass.") }
        ];
      } else if (timelineState === 2) {
        text = "Fellow citizens! Smash that like button for the Socratic method! If we hit 10,000 likes on my Hemlock Live-Stream, I'll debate the entire Spartan senate in 4K resolution!";
        choices = [
          { text: "You're corrupting the timeline, Socrates!", action: () => this.speak("Corruption? Nay, traveler! It is algorithmic democracy! Why ask questions in person when I can conduct Twitter polls?") },
          { text: "Offer an item to swap", action: () => this.showOfferOptions(npc) },
          { text: "Ask about hemlock reviews", isHazard: true, action: () => this.encourageCorruption("Socrates posts a 1-star hemlock review. The tea market collapses.") }
        ];
      } else {
        text = "Greetings, traveler in strange illuminated armor. Tell me: what is virtue? Can it be taught, or should we simply enjoy this calming cup of herbal mint tea under the olive trees?";
        choices = [
          { text: "Virtue is preserving the canon timeline!", action: () => this.speak("A profound assertion! But is the timeline truly yours to preserve, or does time preserve us? Ponder that while I sip my tea.") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Ask if he has seen strange technology", action: () => this.speak("Technology? A traveler dropped a rectangular mirror that hums like an angry cicada near the portico. It was terrifyingly shiny.") }
        ];
      }
    } else if (npc.id === 'archimedes') {
      if (npc.holdingItem && npc.holdingItem.id === 'laser') {
        text = "Sweet Athena! This small crimson wand projects an unbearable ray of pure sunlight! I cut my marble drafting table clean in half in three seconds! Just imagine mounting a hundred of these onto my catapults!";
        choices = [
          { text: "Confiscate the Plasma Laser Cutter", action: () => this.confiscateItem(npc) },
          { text: "Offer a historical replacement item", action: () => this.showOfferOptions(npc) },
          { text: "Encourage him to weaponize it further", isHazard: true, action: () => this.encourageCorruption("Archimedes blueprints an orbital Greek death ray!") }
        ];
      } else if (timelineState === 3) {
        text = "BEHOLD MY MECH-COLOSSUS! Twin hyper-plasma railguns powered by dark matter! Why calculate the volume of a sphere when you can obliterate Roman dreadnoughts from low orbit?!";
        choices = [
          { text: "Archimedes, you're 2,000 years ahead of schedule!", action: () => this.speak("Schedule?! Time is merely a geometric dimension waiting to be severed by a laser beam!") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Test fire the laser cannon", isHazard: true, action: () => this.encourageCorruption("The laser blasts a hole into the timeline fabric!") }
        ];
      } else if (timelineState === 2) {
        text = "The laser ran out of 'battery'! What is lithium?! I have wired 400 lemons with zinc nails to charge it! Do not touch my circuit board or you will be vaporized!";
        choices = [
          { text: "I can take that dangerous tool off your hands.", action: () => this.confiscateItem(npc) },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Ask about his lemon battery", action: () => this.speak("It produces 1.2 gigavolts of citrus power! The air smells deliciously like roasted lemonade.") }
        ];
      } else {
        text = "Do not disturb my sand diagrams! I am calculating levers to lift galleys from the harbor. A lever long enough, and a fulcrum on which to place it, and I shall move the entire world!";
        choices = [
          { text: "Have you found any anomalous devices?", action: () => this.speak("I saw a red cylindrical metal wand glowing near the marble pillars. It was emitting a low frequency hum. Most intriguing!") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Compliment his sand calculations", action: () => this.speak("Ha! At least someone in Athens appreciates geometry over endless rhetorical ramblings!") }
        ];
      }
    } else if (npc.id === 'oracle') {
      if (npc.holdingItem && npc.holdingItem.id === 'drink') {
        text = "I HAVE CONSUMED THE ELIXIR OF THE CYBER-BULL! MY THOUGHTS ARE OSCILLATING AT 8,000 GIGAHERTZ! I CAN SEE ALL FOUR DIMENSIONS OF SPACE-TIME! THE PERSIANS BUY DOGECOIN IN 2021!";
        choices = [
          { text: "Confiscate the empty Neon Energy Can", action: () => this.confiscateItem(npc) },
          { text: "Offer soothing olive oil to calm her down", action: () => this.showOfferOptions(npc) },
          { text: "Ask her what the future holds", isHazard: true, action: () => this.encourageCorruption("The Oracle chants quantum algorithms into the sacred flame!") }
        ];
      } else if (timelineState === 3) {
        text = "INITIALIZING DELPHI-AI PROTOCOL v9.0. Query detected. Oracle-GPT predicts 99.8% probability that Athens is now the synthwave capital of the Milky Way galaxy. All hail the algorithm!";
        choices = [
          { text: "Reboot your organic prophecy mode!", action: () => this.speak("Error 404: Organic prophecy not found. Please insert 50 DrachmaTokens to unlock Pythian insight.") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Ask for a quantum prophecy", isHazard: true, action: () => this.encourageCorruption("Oracle-GPT spawns a self-replicating paradox loop!") }
        ];
      } else if (timelineState === 2) {
        text = "The gods have abandoned laurel leaves! They now speak in decentralised blockchain ledgers! Buy DrachmaCoin before the Delphic halving, mortal traveler!";
        choices = [
          { text: "Crypto didn't exist in 420 BC!", action: () => this.speak("Time is merely a distributed ledger, Chrono-Agent! And Apollo is the ultimate mining node!") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Ask for financial advice", isHazard: true, action: () => this.encourageCorruption("You invest in SpartaSwap. The timeline destabilizes!") }
        ];
      } else {
        text = "The sacred vapors rise from the earth... I foresee a traveler from a thousand tomorrows, cloaked in charcoal armor and a visor of liquid neon light. You come to mend what is torn.";
        choices = [
          { text: "Tell me where the temporal leaks are located.", action: () => this.speak("Look to the agora floor. Three objects from your era fell through the rift: a whispering mirror, a bottled lightning drink, and a beam of focused sun.") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Bow respectfully to Apollo", action: () => this.speak("Apollo nods in approval. Your temporal readings steady for a moment.") }
        ];
      }
    } else if (npc.id === 'merchant') {
      if (timelineState === 3) {
        text = "Step right up to the Neon Acropolis Casino! Bet your cyber-drachmas on Red or Argon Cyan! We got holographic olives, synthetic feta, and genuine space tunics!";
        choices = [
          { text: "Nikos, shut down the casino before reality snaps!", action: () => this.speak("Shut down?! Business has never been better! Even the centaurs are buying roulette chips!") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Place a 100 cyber-drachma bet", isHazard: true, action: () => this.encourageCorruption("The casino jackpot triggers a temporal shockwave!") }
        ];
      } else if (timelineState === 2) {
        text = "Psst! Traveler! I got 240-watt braided nylon fast-charging cables! Only 40 silver drachmas! Compatible with all divine touchscreens!";
        choices = [
          { text: "Where did you get futuristic charging cables?!", action: () => this.speak("Some guy in a silver jumpsuit dropped a crate near the harbor! I know high-margin merchandise when I see it!") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Buy a counterfeit charger", isHazard: true, action: () => this.encourageCorruption("The counterfeit charger shorts out the Agora power grid!") }
        ];
      } else {
        text = "Finest olive oil and figs in all of Attica! Freshly pressed! Do you have drachmas, traveler, or perhaps curious exotic goods to barter?";
        choices = [
          { text: "Have you seen any strange 24th-century objects?", action: () => this.speak("A silver can of drink was dropped near my fruit baskets. It smelled of electric fruit and was glowing green. I moved it to the center plaza.") },
          { text: "Offer an item from inventory", action: () => this.showOfferOptions(npc) },
          { text: "Browse his figs and olives", action: () => this.speak("Delicious, aren't they? Authentic ancient Mediterranean produce at its finest.") }
        ];
      }
    }

    this.typewrite(text);
    this.renderChoices(choices);
  }

  typewrite(text) {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.fullText = text;
    this.charIndex = 0;
    this.dialogueTextEl.textContent = '';

    this.typewriterTimer = setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.dialogueTextEl.textContent += this.fullText[this.charIndex];
        if (this.charIndex % 3 === 0) {
          window.soundEngine.playDialogue();
        }
        this.charIndex++;
      } else {
        clearInterval(this.typewriterTimer);
      }
    }, 18);
  }

  speak(text) {
    this.typewrite(text);
    this.renderChoices([
      { text: "Understood", action: () => this.renderCurrentNode() }
    ]);
  }

  showOfferOptions(npc) {
    const inv = window.itemManager.inventory;
    if (inv.length === 0) {
      this.speak("Your inventory is currently empty! Pick up an item from the agora ground first.");
      return;
    }

    const choices = inv.map(item => ({
      text: `Offer: ${item.icon} ${item.name}`,
      isHazard: item.isContraband,
      action: () => this.giveItemToNpc(npc, item)
    }));

    choices.push({ text: "Nevermind", action: () => this.renderCurrentNode() });

    this.typewrite(`Which item will you offer to ${npc.name}?`);
    this.renderChoices(choices);
  }

  giveItemToNpc(npc, item) {
    window.itemManager.removeItem(item.id);
    const oldItem = npc.holdingItem;
    npc.holdingItem = item;

    if (oldItem) {
      // Drop previous item onto ground near NPC
      oldItem.inInventory = false;
      oldItem.x = npc.x + 24;
      oldItem.y = npc.y + 10;
    }

    if (item.isContraband) {
      // Destabilize timeline!
      window.game.modifyStability(-30);
      window.soundEngine.playGlitch();
      window.particleSystem.triggerGlitchBurst(14);
      this.speak(`${npc.name} eagerly grabs the ${item.name}! [CRITICAL: TIMELINE STABILITY DROPPED BY 30%]`);
    } else {
      // Authentic period item restores balance!
      window.game.modifyStability(+20);
      window.soundEngine.playSuccess();
      this.speak(`${npc.name} gratefully accepts the authentic ${item.name}! [TIMELINE STABILIZED BY +20%]`);
    }
  }

  confiscateItem(npc) {
    if (!npc.holdingItem) return;
    const item = npc.holdingItem;
    npc.holdingItem = null;
    window.itemManager.pickupItem(item);

    // Taking back contraband heals stability
    if (item.isContraband) {
      window.game.modifyStability(+25);
      window.soundEngine.playSuccess();
      this.speak(`You safely confiscated the ${item.name}! Timeline stability restored!`);
    } else {
      this.speak(`You took back the ${item.name}.`);
    }
  }

  encourageCorruption(message) {
    window.game.modifyStability(-20);
    window.soundEngine.playGlitch();
    window.particleSystem.triggerGlitchBurst(12);
    this.speak(`${message} [TIMELINE INTEGRITY CRITICAL: -20%]`);
  }

  renderChoices(choices) {
    this.choicesContainer.innerHTML = '';
    choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-choice-btn' + (c.isHazard ? ' choice-hazard' : '');
      btn.textContent = c.text;
      btn.onclick = () => {
        window.soundEngine.playClick();
        c.action();
      };
      this.choicesContainer.appendChild(btn);
    });
  }
}

window.dialogueManager = new DialogueManager();
