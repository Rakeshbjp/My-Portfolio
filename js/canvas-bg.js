/**
 * ============================================================================
 * MULTI-MODE AMBIENT CREATIVE CANVAS ENGINE
 * ============================================================================
 * Supports 3 high-impact interactive visual modes:
 *   1. Neural Synapse: Interactive physics nodes with mouse gravity & connection mesh
 *   2. Cyber Matrix Rain: Glowing digital matrix rain in current accent color
 *   3. Celestial Warp Drive: 3D accelerating starfield reacting to scroll & pointer
 * Includes corner HUD switcher & Konami Code particle fireworks burst!
 * ============================================================================
 */

(function () {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animationId = null;

  // Active Mode: 'neural' | 'matrix' | 'warp'
  const STORAGE_KEY = 'canvas_mode_preference';
  let currentMode = localStorage.getItem(STORAGE_KEY) || 'neural';

  let mouse = { x: null, y: null, radius: 160 };
  let scrollSpeed = 0;
  let lastScrollY = window.scrollY;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initMode(currentMode);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('scroll', () => {
    const delta = Math.abs(window.scrollY - lastScrollY);
    scrollSpeed = Math.min(delta * 0.2, 15);
    lastScrollY = window.scrollY;
  }, { passive: true });

  function getAccentRGB() {
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary-rgb').trim();
    return primary || '59, 130, 246';
  }

  function getIsDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  // ==========================================================================
  // 1. NEURAL SYNAPSE MODE
  // ==========================================================================
  let neuralNodes = [];

  class NeuralNode {
    constructor() {
      this.reset(true);
    }
    reset(randomStart = false) {
      this.x = randomStart ? Math.random() * width : Math.random() * width;
      this.y = randomStart ? Math.random() * height : (Math.random() > 0.5 ? 0 : height);
      this.size = Math.random() * 2 + 1;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.baseAlpha = Math.random() * 0.35 + 0.15;
      this.alpha = this.baseAlpha;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2.0;
          this.y -= (dy / dist) * force * 2.0;
          this.alpha = Math.min(0.9, this.baseAlpha + force * 0.5);
        } else {
          this.alpha = this.baseAlpha;
        }
      } else {
        this.alpha = this.baseAlpha;
      }
    }
    draw(accentRGB) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentRGB}, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initNeural() {
    neuralNodes = [];
    const count = Math.min(Math.floor((width * height) / 13000), 95);
    for (let i = 0; i < count; i++) {
      neuralNodes.push(new NeuralNode());
    }
  }

  function renderNeural(accentRGB) {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < neuralNodes.length; i++) {
      neuralNodes[i].update();
      neuralNodes[i].draw(accentRGB);

      for (let j = i + 1; j < neuralNodes.length; j++) {
        const dx = neuralNodes[i].x - neuralNodes[j].x;
        const dy = neuralNodes[i].y - neuralNodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const opacity = (1 - dist / 130) * 0.18;
          ctx.beginPath();
          ctx.moveTo(neuralNodes[i].x, neuralNodes[i].y);
          ctx.lineTo(neuralNodes[j].x, neuralNodes[j].y);
          ctx.strokeStyle = `rgba(${accentRGB}, ${opacity})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }
    }
  }

  // ==========================================================================
  // 2. CYBER MATRIX RAIN MODE
  // ==========================================================================
  const matrixChars = '01{}[]<>=/\\+-*#@$&%~ABCDEFGHIJKLMNOPQRSTUVWXYZλπ';
  let matrixColumns = [];
  const fontSize = 15;

  function initMatrix() {
    const numColumns = Math.floor(width / fontSize);
    matrixColumns = [];
    for (let i = 0; i < numColumns; i++) {
      matrixColumns.push({
        y: Math.random() * -100,
        speed: Math.random() * 1.5 + 1.2,
        length: Math.floor(Math.random() * 20 + 8)
      });
    }
  }

  function renderMatrix(accentRGB) {
    const isDark = getIsDark();
    // Soft trailing clear
    ctx.fillStyle = isDark ? 'rgba(9, 13, 22, 0.16)' : 'rgba(248, 250, 252, 0.22)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px 'Fira Code', monospace`;

    for (let i = 0; i < matrixColumns.length; i++) {
      const col = matrixColumns[i];
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * fontSize;
      const y = col.y * fontSize;

      // Glow head character
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${accentRGB}, 0.8)`;
      ctx.fillText(char, x, y);

      // Trailing character
      const trailChar = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      ctx.fillStyle = `rgba(${accentRGB}, 0.65)`;
      ctx.shadowBlur = 3;
      ctx.fillText(trailChar, x, y - fontSize);
      ctx.shadowBlur = 0;

      col.y += col.speed * 0.45;

      if (col.y * fontSize > height && Math.random() > 0.96) {
        col.y = 0;
        col.speed = Math.random() * 1.5 + 1.2;
      }
    }
  }

  // ==========================================================================
  // 3. CELESTIAL WARP DRIVE MODE
  // ==========================================================================
  let warpStars = [];
  const starCount = 300;

  class WarpStar {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = (Math.random() - 0.5) * width * 2;
      this.y = (Math.random() - 0.5) * height * 2;
      this.z = Math.random() * width;
      this.pz = this.z;
    }
    update(speedMultiplier) {
      this.pz = this.z;
      this.z -= (4 + speedMultiplier + scrollSpeed * 2);
      if (this.z <= 0) {
        this.reset();
        this.pz = this.z;
      }
    }
    draw(accentRGB) {
      const cx = width / 2;
      const cy = height / 2;

      const sx = (this.x / this.z) * cx + cx;
      const sy = (this.y / this.z) * cy + cy;

      const px = (this.x / this.pz) * cx + cx;
      const py = (this.y / this.pz) * cy + cy;

      if (sx < 0 || sx > width || sy < 0 || sy > height) {
        return;
      }

      const size = Math.max(0.5, (1 - this.z / width) * 2.5);
      const alpha = Math.min(1, (1 - this.z / width) * 1.2);

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = `rgba(${accentRGB}, ${alpha})`;
      ctx.lineWidth = size;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  function initWarp() {
    warpStars = [];
    for (let i = 0; i < starCount; i++) {
      warpStars.push(new WarpStar());
    }
  }

  function renderWarp(accentRGB) {
    const isDark = getIsDark();
    ctx.fillStyle = isDark ? 'rgba(9, 13, 22, 0.28)' : 'rgba(248, 250, 252, 0.35)';
    ctx.fillRect(0, 0, width, height);

    scrollSpeed *= 0.92; // smooth damping
    const speedMult = mouse.x ? (Math.abs(mouse.x - width / 2) / (width / 2)) * 3 : 1;

    for (let i = 0; i < warpStars.length; i++) {
      warpStars[i].update(speedMult);
      warpStars[i].draw(accentRGB);
    }
  }

  // ==========================================================================
  // 4. CELEBRATION FIREWORKS BURST (KONAMI CODE EASTER EGG)
  // ==========================================================================
  let fireworksParticles = [];

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.012;
      this.color = color;
      this.size = Math.random() * 3 + 2;
      this.gravity = 0.08;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.alpha -= this.decay;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(')', `, ${Math.max(0, this.alpha)})`).replace('rgb', 'rgba');
      ctx.fill();
    }
  }

  function triggerCelebrationFireworks() {
    const colors = [
      'rgb(245, 158, 11)',
      'rgb(234, 179, 8)',
      'rgb(16, 185, 129)',
      'rgb(59, 130, 246)',
      'rgb(236, 72, 153)',
      'rgb(139, 92, 246)'
    ];
    for (let burst = 0; burst < 5; burst++) {
      setTimeout(() => {
        const cx = Math.random() * (width * 0.7) + width * 0.15;
        const cy = Math.random() * (height * 0.6) + height * 0.15;
        for (let i = 0; i < 45; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          fireworksParticles.push(new FireworkParticle(cx, cy, color));
        }
      }, burst * 220);
    }
  }

  window.triggerCelebrationFireworks = triggerCelebrationFireworks;

  // ==========================================================================
  // CORE ENGINE RUNNER
  // ==========================================================================
  function initMode(mode) {
    if (mode === 'neural') initNeural();
    else if (mode === 'matrix') initMatrix();
    else if (mode === 'warp') initWarp();
  }

  function switchMode(newMode) {
    if (!['neural', 'matrix', 'warp'].includes(newMode)) return;
    currentMode = newMode;
    localStorage.setItem(STORAGE_KEY, newMode);
    ctx.clearRect(0, 0, width, height);
    initMode(currentMode);
    updateHudUI();
    if (window.portfolioAudio) {
      window.portfolioAudio.playWarp();
    }
    if (typeof window.showToast === 'function') {
      const modeNames = {
        neural: 'Neural Synapse 🧠',
        matrix: 'Cyber Matrix 🟩',
        warp: 'Celestial Warp ✨'
      };
      window.showToast(`Canvas Mode: ${modeNames[newMode]}`);
    }
  }

  window.setCanvasMode = switchMode;
  window.getCanvasMode = () => currentMode;

  function loop() {
    const accentRGB = getAccentRGB();

    if (currentMode === 'neural') {
      renderNeural(accentRGB);
    } else if (currentMode === 'matrix') {
      renderMatrix(accentRGB);
    } else if (currentMode === 'warp') {
      renderWarp(accentRGB);
    }

    // Render active fireworks overlays
    if (fireworksParticles.length > 0) {
      for (let i = fireworksParticles.length - 1; i >= 0; i--) {
        const p = fireworksParticles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          fireworksParticles.splice(i, 1);
        }
      }
    }

    animationId = requestAnimationFrame(loop);
  }

  // ==========================================================================
  // CORNER CANVAS HUD SWITCHER
  // ==========================================================================
  function createHud() {
    let hud = document.getElementById('canvas-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'canvas-hud';
      hud.className = 'canvas-hud';
      hud.innerHTML = `
        <div class="hud-inner">
          <span class="hud-label">AMBIENT FX</span>
          <div class="hud-buttons">
            <button class="hud-btn" data-mode="neural" title="Neural Synapse Mode (Connecting Nodes)">
              <span class="hud-icon">🧠</span>
              <span class="hud-text">Neural</span>
            </button>
            <button class="hud-btn" data-mode="matrix" title="Cyber Matrix Rain Mode">
              <span class="hud-icon">🟩</span>
              <span class="hud-text">Matrix</span>
            </button>
            <button class="hud-btn" data-mode="warp" title="Celestial Warp Drive Mode">
              <span class="hud-icon">✨</span>
              <span class="hud-text">Warp</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(hud);

      hud.querySelectorAll('.hud-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const target = e.currentTarget;
          const mode = target.getAttribute('data-mode');
          switchMode(mode);
        });
      });
    }
    updateHudUI();
  }

  function updateHudUI() {
    const hud = document.getElementById('canvas-hud');
    if (!hud) return;
    hud.querySelectorAll('.hud-btn').forEach(btn => {
      if (btn.getAttribute('data-mode') === currentMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function boot() {
    resize();
    createHud();
    if (animationId) cancelAnimationFrame(animationId);
    loop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
