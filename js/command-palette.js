/**
 * ============================================================================
 * SPOTLIGHT COMMAND PALETTE (CTRL + K / CMD + K)
 * ============================================================================
 * Instant keyboard-driven global search and action bar indexing:
 * - Sections navigation
 * - Projects search & direct modal peek
 * - Skills & technology search
 * - Instant theme, accent, canvas mode, sound, and terminal triggers
 * ============================================================================
 */

(function () {
  let modalEl = null;
  let inputEl = null;
  let listEl = null;
  let activeIndex = 0;
  let filteredItems = [];

  function getPaletteItems() {
    const data = window.getWorkingData ? window.getWorkingData() : (window.portfolioData || {});
    const items = [];

    // 1. Navigation Sections
    items.push(
      { category: 'Navigation', icon: '🏠', label: 'Go to Hero / Overview', action: () => scrollToSection('#hero') },
      { category: 'Navigation', icon: '🛠️', label: 'Go to Skills Matrix', action: () => scrollToSection('#skills') },
      { category: 'Navigation', icon: '🚀', label: 'Go to Projects Showcase', action: () => scrollToSection('#projects') },
      { category: 'Navigation', icon: '💼', label: 'Go to Work Experience', action: () => scrollToSection('#experience') },
      { category: 'Navigation', icon: '📜', label: 'Go to Certifications', action: () => scrollToSection('#certifications') },
      { category: 'Navigation', icon: '📄', label: 'Go to Interactive Resume', action: () => scrollToSection('#resume') },
      { category: 'Navigation', icon: '📬', label: 'Go to Contact & Collaboration', action: () => scrollToSection('#contact') }
    );

    // 2. Projects
    if (Array.isArray(data.projects)) {
      data.projects.forEach((proj, idx) => {
        items.push({
          category: 'Projects',
          icon: '🚀',
          label: `${proj.title} (${(proj.techStack || []).slice(0, 3).join(', ')})`,
          subtext: proj.summary || 'View project architecture & details',
          action: () => {
            scrollToSection('#projects');
            setTimeout(() => {
              if (typeof window.openProjectModalByIndex === 'function') {
                window.openProjectModalByIndex(idx);
              }
            }, 300);
          }
        });
      });
    }

    // 3. Skills
    if (Array.isArray(data.skills)) {
      data.skills.forEach(group => {
        (group.items || []).forEach(skill => {
          items.push({
            category: 'Skills',
            icon: '⚡',
            label: `${skill.name} (${group.category})`,
            subtext: `Proficiency: ${skill.proficiency || 85}% • ${skill.level || 'Proficient'}`,
            action: () => {
              scrollToSection('#skills');
              const searchInput = document.getElementById('skills-search');
              if (searchInput) {
                searchInput.value = skill.name;
                if (typeof window.renderSkills === 'function') {
                  window.renderSkills();
                }
              }
            }
          });
        });
      });
    }

    // 4. Quick Actions
    items.push(
      {
        category: 'Quick Actions',
        icon: '💻',
        label: 'Open Interactive Terminal (~CLI)',
        subtext: 'Run UNIX developer commands, neofetch, and games',
        action: () => {
          if (typeof window.openTerminalModal === 'function') {
            window.openTerminalModal();
          }
        }
      },
      {
        category: 'Quick Actions',
        icon: '🌗',
        label: 'Toggle Dark / Light Theme',
        subtext: 'Switch between dark and light color modes',
        action: () => {
          const current = document.documentElement.getAttribute('data-theme') || 'dark';
          const next = current === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('theme_preference', next);
          if (window.showToast) window.showToast(`Switched to ${next} mode`);
        }
      },
      {
        category: 'Quick Actions',
        icon: '🔵',
        label: 'Set Accent: Tech Blue',
        subtext: 'Cool modern developer cyan-blue aesthetic',
        action: () => setAccent('blue')
      },
      {
        category: 'Quick Actions',
        icon: '🟢',
        label: 'Set Accent: Cyber Emerald',
        subtext: 'Vibrant matrix terminal emerald theme',
        action: () => setAccent('emerald')
      },
      {
        category: 'Quick Actions',
        icon: '🟣',
        label: 'Set Accent: Electric Purple',
        subtext: 'Creative synthwave ultraviolet aesthetic',
        action: () => setAccent('purple')
      },
      {
        category: 'Quick Actions',
        icon: '🟡',
        label: 'Set Accent: Sunset Gold',
        subtext: 'Warm executive high-contrast gold theme',
        action: () => setAccent('gold')
      },
      {
        category: 'Quick Actions',
        icon: '🧠',
        label: 'Ambient Canvas: Neural Synapse',
        subtext: 'Interactive physics nodes with mouse gravity',
        action: () => {
          if (window.setCanvasMode) window.setCanvasMode('neural');
        }
      },
      {
        category: 'Quick Actions',
        icon: '🟩',
        label: 'Ambient Canvas: Cyber Matrix Rain',
        subtext: 'Glowing digital rain in current accent color',
        action: () => {
          if (window.setCanvasMode) window.setCanvasMode('matrix');
        }
      },
      {
        category: 'Quick Actions',
        icon: '✨',
        label: 'Ambient Canvas: Celestial Warp Drive',
        subtext: 'Accelerating 3D starfield reacting to scroll',
        action: () => {
          if (window.setCanvasMode) window.setCanvasMode('warp');
        }
      },
      {
        category: 'Quick Actions',
        icon: '📄',
        label: 'Download Resume PDF',
        subtext: 'Download official print-ready curriculum vitae',
        action: () => {
          if (window.downloadResumePdf) window.downloadResumePdf();
        }
      },
      {
        category: 'Quick Actions',
        icon: '⚙️',
        label: 'Open Portfolio Settings & Live Customizer',
        subtext: 'Edit profile avatar, skills, projects, and data backups',
        action: () => {
          if (window.openCustomizer) window.openCustomizer();
        }
      }
    );

    return items;
  }

  function setAccent(accent) {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('accent_preference', accent);
    if (window.showToast) window.showToast(`Accent color set to ${accent}`);
  }

  function scrollToSection(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function openCommandPalette() {
    if (!modalEl) createModal();
    modalEl.classList.add('active');
    inputEl.value = '';
    activeIndex = 0;
    renderResults('');
    setTimeout(() => inputEl.focus(), 50);

    if (window.portfolioAudio) {
      window.portfolioAudio.playWarp();
    }
  }

  function closeCommandPalette() {
    if (modalEl) {
      modalEl.classList.remove('active');
    }
  }

  function renderResults(query) {
    const allItems = getPaletteItems();
    const q = (query || '').toLowerCase().trim();

    if (!q) {
      filteredItems = allItems;
    } else {
      filteredItems = allItems.filter(item => {
        return item.label.toLowerCase().includes(q) ||
          (item.subtext && item.subtext.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q);
      });
    }

    if (activeIndex >= filteredItems.length) {
      activeIndex = Math.max(0, filteredItems.length - 1);
    }

    if (filteredItems.length === 0) {
      listEl.innerHTML = `
        <div class="palette-empty-state">
          <span>🔍</span>
          <p>No results found for "<strong>${escapeHtml(query)}</strong>"</p>
          <span style="font-size: 0.75rem; color: var(--text-dim);">Try searching "React", "Projects", "Theme", "Terminal"</span>
        </div>
      `;
      return;
    }

    // Group by category
    const grouped = {};
    filteredItems.forEach((item, index) => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push({ item, index });
    });

    let html = '';
    for (const [category, entries] of Object.entries(grouped)) {
      html += `<div class="palette-group-title">${category}</div>`;
      entries.forEach(({ item, index }) => {
        const isSelected = index === activeIndex;
        html += `
          <div class="palette-item ${isSelected ? 'active' : ''}" data-index="${index}">
            <span class="palette-item-icon">${item.icon}</span>
            <div class="palette-item-content">
              <div class="palette-item-label">${highlightMatch(item.label, q)}</div>
              ${item.subtext ? `<div class="palette-item-subtext">${escapeHtml(item.subtext)}</div>` : ''}
            </div>
            <span class="palette-item-enter-hint">↵</span>
          </div>
        `;
      });
    }

    listEl.innerHTML = html;

    // Attach click listeners to rendered items
    listEl.querySelectorAll('.palette-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        executeItem(idx);
      });
      el.addEventListener('mouseenter', () => {
        activeIndex = parseInt(el.getAttribute('data-index'), 10);
        updateActiveItemStyles();
      });
    });

    scrollActiveIntoView();
  }

  function updateActiveItemStyles() {
    listEl.querySelectorAll('.palette-item').forEach(el => {
      const idx = parseInt(el.getAttribute('data-index'), 10);
      if (idx === activeIndex) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  function scrollActiveIntoView() {
    const activeEl = listEl.querySelector('.palette-item.active');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function executeItem(index) {
    const item = filteredItems[index];
    if (item && typeof item.action === 'function') {
      closeCommandPalette();
      if (window.portfolioAudio) {
        window.portfolioAudio.playClick();
      }
      item.action();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  function createModal() {
    modalEl = document.getElementById('command-palette-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'command-palette-modal';
      modalEl.className = 'palette-modal-backdrop';
      modalEl.innerHTML = `
        <div class="palette-box">
          <div class="palette-search-bar">
            <span class="palette-search-icon">🔍</span>
            <input type="text" id="palette-search-input" class="palette-search-input" placeholder="Type a command or search anything..." autocomplete="off" spellcheck="false" />
            <kbd class="palette-kbd">ESC</kbd>
          </div>
          <div class="palette-results-list" id="palette-results-list"></div>
          <div class="palette-footer">
            <span class="palette-shortcut-hint">Navigate <kbd>↑</kbd> <kbd>↓</kbd></span>
            <span class="palette-shortcut-hint">Select <kbd>↵</kbd></span>
            <span class="palette-shortcut-hint">Close <kbd>ESC</kbd></span>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      inputEl = modalEl.querySelector('#palette-search-input');
      listEl = modalEl.querySelector('#palette-results-list');

      inputEl.addEventListener('input', (e) => {
        activeIndex = 0;
        renderResults(e.target.value);
      });

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (filteredItems.length > 0) {
            activeIndex = (activeIndex + 1) % filteredItems.length;
            updateActiveItemStyles();
            scrollActiveIntoView();
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (filteredItems.length > 0) {
            activeIndex = (activeIndex - 1 + filteredItems.length) % filteredItems.length;
            updateActiveItemStyles();
            scrollActiveIntoView();
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredItems[activeIndex]) {
            executeItem(activeIndex);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeCommandPalette();
        }
      });

      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          closeCommandPalette();
        }
      });
    } else {
      inputEl = modalEl.querySelector('#palette-search-input');
      listEl = modalEl.querySelector('#palette-results-list');
    }
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl + K or Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modalEl && modalEl.classList.contains('active')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
  });

  // Export to Global Scope
  window.openCommandPalette = openCommandPalette;
  window.closeCommandPalette = closeCommandPalette;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createModal);
  } else {
    createModal();
  }
})();
