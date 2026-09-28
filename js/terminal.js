/**
 * ============================================================================
 * INTERACTIVE TERMINAL / DEVELOPER OS CLI (ZSH)
 * ============================================================================
 * Retro-futuristic hacker terminal with UNIX command parser:
 * - neofetch ASCII art & system specs
 * - interactive project/skill explorer
 * - canvas mode toggles & theme controls
 * - retro terminal mini-game ("Bug Hunter")
 * - sudo hire-rakesh easter egg & command history
 * ============================================================================
 */

(function () {
  let terminalEl = null;
  let historyEl = null;
  let inputEl = null;
  let dockBtn = null;

  const commandHistory = [];
  let historyIndex = -1;

  // Mini-Game State
  let gameActive = false;
  let gameScore = 0;
  let gameTargetBug = '';

  function createTerminalDOM() {
    // 1. Floating Dock Button
    dockBtn = document.getElementById('terminal-dock-btn');
    if (!dockBtn) {
      dockBtn = document.createElement('button');
      dockBtn.id = 'terminal-dock-btn';
      dockBtn.className = 'terminal-dock-btn';
      dockBtn.setAttribute('title', 'Open Developer Terminal (~CLI)');
      dockBtn.setAttribute('aria-label', 'Open Developer Terminal (~CLI)');
      dockBtn.innerHTML = `
        <span class="dock-pulse"></span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
        <span class="dock-text">~CLI</span>
        <kbd class="dock-kbd">\`</kbd>
      `;
      document.body.appendChild(dockBtn);

      dockBtn.addEventListener('click', () => {
        toggleTerminal();
      });
    }

    // 2. Terminal Window Modal / Drawer
    terminalEl = document.getElementById('terminal-modal');
    if (!terminalEl) {
      terminalEl = document.createElement('div');
      terminalEl.id = 'terminal-modal';
      terminalEl.className = 'terminal-window-wrapper';
      terminalEl.innerHTML = `
        <div class="terminal-window">
          <div class="terminal-titlebar">
            <div class="terminal-dots">
              <span class="dot dot-close" title="Close"></span>
              <span class="dot dot-minimize" title="Minimize"></span>
              <span class="dot dot-maximize" title="Maximize"></span>
            </div>
            <div class="terminal-title">rakesh@portfolio-os: ~ (zsh)</div>
            <div class="terminal-actions">
              <button class="terminal-action-btn" id="terminal-clear-header-btn" title="Clear Buffer">Clear</button>
            </div>
          </div>
          <div class="terminal-scanlines"></div>
          <div class="terminal-body" id="terminal-body">
            <div class="terminal-history" id="terminal-history">
              <div class="terminal-welcome">
                <span class="term-accent">Developer OS v2.4 (x86_64-portfolio-darwin)</span><br/>
                Type <span class="term-highlight">'help'</span> for available commands or <span class="term-highlight">'neofetch'</span> for system specs.<br/>
                Try <span class="term-highlight">'sudo hire-rakesh'</span> or <span class="term-highlight">'play'</span> for a mini-game.
              </div>
            </div>
            <div class="terminal-prompt-line">
              <span class="term-prompt-user">rakesh@portfolio</span>:<span class="term-prompt-dir">~</span>$&nbsp;
              <input type="text" id="terminal-input" class="terminal-input" autocomplete="off" spellcheck="false" />
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(terminalEl);

      historyEl = terminalEl.querySelector('#terminal-history');
      inputEl = terminalEl.querySelector('#terminal-input');

      // Titlebar buttons
      terminalEl.querySelector('.dot-close').addEventListener('click', closeTerminal);
      terminalEl.querySelector('.dot-minimize').addEventListener('click', closeTerminal);
      terminalEl.querySelector('.dot-maximize').addEventListener('click', () => {
        terminalEl.classList.toggle('maximized');
      });
      terminalEl.querySelector('#terminal-clear-header-btn').addEventListener('click', clearBuffer);

      // Focus input when clicking anywhere inside terminal body
      terminalEl.querySelector('.terminal-body').addEventListener('click', () => {
        if (inputEl) inputEl.focus();
      });

      // Terminal input key listener
      inputEl.addEventListener('keydown', handleInputKeyDown);
    }
  }

  function toggleTerminal() {
    if (terminalEl && terminalEl.classList.contains('active')) {
      closeTerminal();
    } else {
      openTerminal();
    }
  }

  function openTerminal() {
    if (!terminalEl) createTerminalDOM();
    terminalEl.classList.add('active');
    setTimeout(() => {
      if (inputEl) {
        inputEl.focus();
        scrollToBottom();
      }
    }, 50);

    if (window.portfolioAudio) {
      window.portfolioAudio.playBeep(440, 0.05);
    }
  }

  function closeTerminal() {
    if (terminalEl) {
      terminalEl.classList.remove('active');
    }
  }

  function scrollToBottom() {
    const body = terminalEl.querySelector('.terminal-body');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  function clearBuffer() {
    if (historyEl) {
      historyEl.innerHTML = `
        <div class="terminal-welcome">
          Buffer cleared. Type <span class="term-highlight">'help'</span> for commands.
        </div>
      `;
      scrollToBottom();
    }
  }

  function handleInputKeyDown(e) {
    if (window.portfolioAudio) {
      window.portfolioAudio.playBeep(700 + Math.random() * 200, 0.02);
    }

    if (e.key === 'Enter') {
      const raw = inputEl.value;
      const cmd = raw.trim();
      inputEl.value = '';

      if (cmd) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
      }

      executeCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex > 0) {
        historyIndex--;
        inputEl.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputEl.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        inputEl.value = '';
      }
    } else if (e.key === 'Escape') {
      closeTerminal();
    }
  }

  // UNIX Command Processor
  function executeCommand(input) {
    appendHistoryLine(`rakesh@portfolio:~$ ${escapeHtml(input)}`, 'cmd-echo');

    if (!input) {
      scrollToBottom();
      return;
    }

    const parts = input.split(' ').filter(Boolean);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Mini-Game Handler
    if (gameActive) {
      handleGameInput(cmd);
      return;
    }

    switch (cmd) {
      case 'help':
        renderHelp();
        break;

      case 'bio':
      case 'about':
        renderBio();
        break;

      case 'skills':
        renderSkills(args);
        break;

      case 'projects':
        renderProjects(args);
        break;

      case 'contact':
        renderContact();
        break;

      case 'neofetch':
      case 'sys':
      case 'info':
        renderNeofetch();
        break;

      case 'matrix':
        if (window.setCanvasMode) window.setCanvasMode('matrix');
        appendHistoryLine("Cyber Matrix digital rain initialized. Look at the background! 🟩", 'success');
        break;

      case 'warp':
        if (window.setCanvasMode) window.setCanvasMode('warp');
        appendHistoryLine("Celestial Warp Drive starfield engaged. Scroll to accelerate! ✨", 'success');
        break;

      case 'neural':
        if (window.setCanvasMode) window.setCanvasMode('neural');
        appendHistoryLine("Neural Synapse interactive mesh online. 🧠", 'success');
        break;

      case 'theme':
        if (args[0] === 'dark' || args[0] === 'light') {
          document.documentElement.setAttribute('data-theme', args[0]);
          localStorage.setItem('theme_preference', args[0]);
          appendHistoryLine(`Switched theme to ${args[0]} mode.`, 'success');
        } else {
          appendHistoryLine("Usage: theme [dark|light]", 'error');
        }
        break;

      case 'accent':
        const validAccents = ['blue', 'emerald', 'purple', 'gold'];
        if (validAccents.includes(args[0])) {
          document.documentElement.setAttribute('data-accent', args[0]);
          localStorage.setItem('accent_preference', args[0]);
          appendHistoryLine(`Accent color switched to '${args[0]}'.`, 'success');
        } else {
          appendHistoryLine(`Usage: accent [blue|emerald|purple|gold]`, 'error');
        }
        break;

      case 'sound':
        if (args[0] === 'on') {
          if (window.portfolioAudio) window.portfolioAudio.setMuted(false);
          appendHistoryLine("Web Audio FX enabled 🔊", 'success');
        } else if (args[0] === 'off') {
          if (window.portfolioAudio) window.portfolioAudio.setMuted(true);
          appendHistoryLine("Web Audio FX muted 🔇", 'success');
        } else {
          appendHistoryLine("Usage: sound [on|off]", 'error');
        }
        break;

      case 'sudo':
        if (args.join(' ') === 'hire-rakesh' || args.join(' ') === 'hire') {
          renderHireRakesh();
        } else {
          appendHistoryLine(`sudo: ${escapeHtml(args.join(' '))}: permission granted! But maybe you meant 'sudo hire-rakesh'?`, 'term-accent');
        }
        break;

      case 'play':
      case 'game':
        startBugHunterGame();
        break;

      case 'clear':
        clearBuffer();
        return;

      case 'exit':
      case 'close':
      case 'quit':
        closeTerminal();
        break;

      default:
        appendHistoryLine(`zsh: command not found: ${escapeHtml(cmd)}. Type <span class="term-highlight">'help'</span> for instructions.`, 'error');
        break;
    }

    scrollToBottom();
  }

  function appendHistoryLine(content, type = '') {
    if (!historyEl) return;
    const div = document.createElement('div');
    div.className = `term-line ${type}`;
    div.innerHTML = content;
    historyEl.appendChild(div);
  }

  function renderHelp() {
    const helpTable = `
      <div class="term-table">
        <div class="term-row"><span class="term-col-cmd">neofetch</span> <span class="term-col-desc">Display developer OS stats & ASCII emblem</span></div>
        <div class="term-row"><span class="term-col-cmd">bio</span> <span class="term-col-desc">Print engineer overview and summary</span></div>
        <div class="term-row"><span class="term-col-cmd">skills</span> <span class="term-col-desc">List technical competencies and proficiencies</span></div>
        <div class="term-row"><span class="term-col-cmd">projects</span> <span class="term-col-desc">Show production projects & repositories</span></div>
        <div class="term-row"><span class="term-col-cmd">contact</span> <span class="term-col-desc">Get email, telephone, location, and profiles</span></div>
        <div class="term-row"><span class="term-col-cmd">matrix / warp / neural</span> <span class="term-col-desc">Switch background visual animation modes</span></div>
        <div class="term-row"><span class="term-col-cmd">theme [dark|light]</span> <span class="term-col-desc">Toggle color mode</span></div>
        <div class="term-row"><span class="term-col-cmd">accent [blue|emerald|purple|gold]</span> <span class="term-col-desc">Change interface accent palette</span></div>
        <div class="term-row"><span class="term-col-cmd">sudo hire-rakesh</span> <span class="term-col-desc">Execute immediate recruitment protocol</span></div>
        <div class="term-row"><span class="term-col-cmd">play</span> <span class="term-col-desc">Play retro terminal Bug Hunter mini-game</span></div>
        <div class="term-row"><span class="term-col-cmd">clear / exit</span> <span class="term-col-desc">Clear output buffer or dismiss terminal</span></div>
      </div>
    `;
    appendHistoryLine(helpTable);
  }

  function renderNeofetch() {
    const data = window.getWorkingData ? window.getWorkingData() : (window.portfolioData || {});
    const p = data.personal || {};

    const asciiLogo = `
<pre class="term-ascii-art">
   ______   __  __
  / ____/  / / / /   S RAKESH KUMAR
 / / __   / /_/ /    ----------------
/ /_/ /  / __  /     OS: PortfolioOS v2.4 (x86_64)
\\____/  /_/ /_/      Host: Full Stack MERN Engineer
                     Kernel: Node.js & React Core
                     Uptime: 4+ Years of Code
                     Shell: devsh 1.4.2
                     Location: Bengaluru, Karnataka, IN
                     Stack: MongoDB, Express, React, Node
                     Status: 🟢 Available for High-Impact Roles
                     Theme: Dark Glassmorphic Modern
</pre>`;
    appendHistoryLine(asciiLogo);
  }

  function renderBio() {
    const data = window.getWorkingData ? window.getWorkingData() : (window.portfolioData || {});
    const p = data.personal || {};
    appendHistoryLine(`
      <strong class="term-accent">${p.name || 'S Rakesh Kumar'}</strong> — ${p.title || 'Full Stack Developer'}<br/>
      ${p.bio || 'Computer Science Engineering graduate and aspiring MERN Stack Developer.'}<br/>
      <span style="color: var(--text-muted);">Location: ${p.location || 'Bengaluru, India'} • Email: ${p.email || 'N/A'}</span>
    `);
  }

  function renderSkills() {
    const data = window.getWorkingData ? window.getWorkingData() : (window.portfolioData || {});
    const skills = data.skills || [];

    let out = '<div style="margin-top: 0.35rem;">';
    skills.forEach(cat => {
      out += `<div class="term-accent" style="margin-top: 0.5rem; font-weight: 700;">📂 ${cat.category}</div>`;
      (cat.items || []).forEach(item => {
        const barLength = Math.round((item.proficiency || 85) / 10);
        const bar = '■'.repeat(barLength) + '□'.repeat(10 - barLength);
        out += `<div style="font-family: var(--font-mono); font-size: 0.82rem; margin-left: 1rem;">
          <span style="display: inline-block; width: 180px;">${item.name}</span>
          <span style="color: var(--accent-primary);">${bar}</span> ${item.proficiency || 85}% (${item.level || 'Proficient'})
        </div>`;
      });
    });
    out += '</div>';
    appendHistoryLine(out);
  }

  function renderProjects() {
    const data = window.getWorkingData ? window.getWorkingData() : (window.portfolioData || {});
    const projs = data.projects || [];

    let out = '<div style="margin-top: 0.35rem;">';
    projs.forEach((p, idx) => {
      out += `
        <div style="margin-bottom: 0.75rem;">
          <span class="term-highlight">#${idx + 1} ${escapeHtml(p.title)}</span> <span style="font-size: 0.75rem; color: var(--text-dim);">[${p.category || 'MERN'}]</span><br/>
          <span style="color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(p.summary || '')}</span><br/>
          <span style="color: var(--accent-primary); font-size: 0.8rem;">Stack: ${(p.techStack || []).join(', ')}</span>
        </div>
      `;
    });
    out += '</div>';
    appendHistoryLine(out);
  }

  function renderContact() {
    const data = window.getWorkingData ? window.getWorkingData() : (window.portfolioData || {});
    const p = data.personal || {};

    appendHistoryLine(`
      <div style="line-height: 1.6;">
        📧 Email: <a href="mailto:${p.email}" style="color: var(--accent-primary);">${p.email || 'N/A'}</a><br/>
        📱 Phone: ${p.phone || 'N/A'}<br/>
        📍 Location: ${p.location || 'Bengaluru, India'}<br/>
        🐙 GitHub: <a href="${p.github}" target="_blank" style="color: var(--accent-primary);">${p.github || 'N/A'}</a><br/>
        💼 LinkedIn: <a href="${p.linkedin}" target="_blank" style="color: var(--accent-primary);">${p.linkedin || 'N/A'}</a>
      </div>
    `);
  }

  function renderHireRakesh() {
    if (window.portfolioAudio) {
      window.portfolioAudio.playCelebration();
    }
    if (window.triggerCelebrationFireworks) {
      window.triggerCelebrationFireworks();
    }

    const output = `
<pre class="term-accent" style="font-weight: bold; margin: 0.5rem 0;">
   🏆 [EXCELLENT DECISION ACQUIRED] 🏆
==================================================
  Candidate: S Rakesh Kumar
  Match: 100% Fit for Engineering Leadership & MERN Stack
  Status: Offer Letter Generation In Progress...
==================================================
</pre>
    <div style="margin-bottom: 0.5rem;">
      Thank you for exploring! Scrolling you directly to the <strong>Collaboration Estimator</strong>...
    </div>`;
    appendHistoryLine(output);

    setTimeout(() => {
      closeTerminal();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1800);
  }

  // Mini-Game: Bug Hunter
  const bugs = ['NullPointerException', 'SegmentationFault', 'UndefinedVariable', 'MemoryLeak', 'AsyncRaceCondition', 'CORSBlockedError'];

  function startBugHunterGame() {
    gameActive = true;
    gameScore = 0;
    spawnBug();
  }

  function spawnBug() {
    gameTargetBug = bugs[Math.floor(Math.random() * bugs.length)];
    appendHistoryLine(`
      <div style="background: rgba(239, 68, 68, 0.15); border: 1px dashed #ef4444; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
        👾 <strong>ALERT! A critical bug has appeared in production:</strong><br/>
        Target Bug: <span style="color: #ef4444; font-weight: 700; font-size: 1.05rem;">${gameTargetBug}</span><br/>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Quick! Type <code>squash</code> or <code>fix</code> to resolve it, or <code>stop</code> to quit. Current Score: <strong>${gameScore}</strong></span>
      </div>
    `);
    scrollToBottom();
  }

  function handleGameInput(input) {
    if (input === 'squash' || input === 'fix' || input === gameTargetBug.toLowerCase()) {
      gameScore += 10;
      if (window.portfolioAudio) window.portfolioAudio.playChime();
      appendHistoryLine(`✅ Successfully squashed <span style="color: #10b981;">${gameTargetBug}</span>! +10 Points. Total: ${gameScore}`, 'success');
      if (gameScore >= 50) {
        appendHistoryLine(`🎉 <strong>CONGRATULATIONS! You achieved Bug Master Level (Score: ${gameScore})!</strong> Exiting game.`, 'term-accent');
        gameActive = false;
        if (window.triggerCelebrationFireworks) window.triggerCelebrationFireworks();
      } else {
        setTimeout(spawnBug, 400);
      }
    } else if (input === 'stop' || input === 'exit' || input === 'quit') {
      appendHistoryLine(`Game aborted. Final Score: ${gameScore}.`, 'term-accent');
      gameActive = false;
    } else {
      appendHistoryLine(`❌ Missed! Type <code>squash</code> to resolve the bug, or <code>stop</code> to exit.`, 'error');
    }
    scrollToBottom();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Backtick (`) or Ctrl + ` hotkey listener
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      toggleTerminal();
    }
  });

  // Export to global window scope
  window.openTerminalModal = openTerminal;
  window.closeTerminalModal = closeTerminal;
  window.toggleTerminalModal = toggleTerminal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTerminalDOM);
  } else {
    createTerminalDOM();
  }
})();
