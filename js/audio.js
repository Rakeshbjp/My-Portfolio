/**
 * ============================================================================
 * SYNTHESIZED WEB AUDIO SUITE (ZERO EXTERNAL ASSETS)
 * ============================================================================
 * Generative micro-sound effects using the Web Audio API for tactile feedback.
 * Includes volume/mute state persistence and animated audio wave controller.
 * ============================================================================
 */

(function () {
  let audioCtx = null;
  const STORAGE_KEY = 'portfolio_audio_muted';
  
  // Default muted to respect browser autoplay policies and user preference
  let isMuted = localStorage.getItem(STORAGE_KEY) !== 'false';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // 1. Subtle Mechanical Click (Tabs, Buttons, Switches)
  function playClick() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // 2. Soft Futuristic Chime (Modals, Form Submit, Success)
  function playChime() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.35);
      });
    } catch (e) {}
  }

  // 3. Retro Terminal Blip / Key Tap
  function playBeep(freq = 880, duration = 0.03) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  // 4. Warp / Spotlight Sweep (Command Palette Open)
  function playWarp() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(960, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // 5. Celebration Fanfare (Easter Egg / Konami Code)
  function playCelebration() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      // Arpeggiated victory chord
      const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.6);
      });
    } catch (e) {}
  }

  function setMuted(muted) {
    isMuted = muted;
    localStorage.setItem(STORAGE_KEY, muted ? 'true' : 'false');
    updateMuteUI();
    if (!muted) {
      getAudioContext();
      playChime();
    }
  }

  function toggleMute() {
    setMuted(!isMuted);
    return isMuted;
  }

  function updateMuteUI() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (!audioBtn) return;

    if (isMuted) {
      audioBtn.classList.remove('active');
      audioBtn.setAttribute('title', 'Sound FX: Off (Click to Enable)');
      audioBtn.setAttribute('aria-label', 'Sound FX: Off (Click to Enable)');
      audioBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
    } else {
      audioBtn.classList.add('active');
      audioBtn.setAttribute('title', 'Sound FX: On (Click to Mute)');
      audioBtn.setAttribute('aria-label', 'Sound FX: On (Click to Mute)');
      audioBtn.innerHTML = `
        <div class="audio-wave-icon">
          <span class="bar bar-1"></span>
          <span class="bar bar-2"></span>
          <span class="bar bar-3"></span>
          <span class="bar bar-4"></span>
        </div>
      `;
    }
  }

  function initAudioController() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const nextMuted = toggleMute();
        if (typeof window.showToast === 'function') {
          window.showToast(nextMuted ? 'Sound FX Muted 🔇' : 'Sound FX Enabled 🔊');
        }
      });
    }
    updateMuteUI();

    // Attach subtle click listeners to interactive elements
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, .tab-btn, .nav-link, .accent-dot, .link-btn, .project-card');
      if (target && !target.hasAttribute('data-no-sound')) {
        playClick();
      }
    });
  }

  // Export to global scope
  window.portfolioAudio = {
    playClick,
    playChime,
    playBeep,
    playWarp,
    playCelebration,
    toggleMute,
    setMuted,
    isMuted: () => isMuted
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudioController);
  } else {
    initAudioController();
  }
})();
