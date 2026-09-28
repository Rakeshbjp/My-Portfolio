/**
 * ============================================================================
 * CORE APPLICATION CONTROLLER & DOM RENDERER
 * ============================================================================
 */

(function () {
  // SVG Icon Helpers (Inline for 100% offline & fast rendering)
  const ICONS = {
    code: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    terminal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
    cpu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>`,
    shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    layers: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    layout: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
    grid: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
    feather: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 13v5h5l12.24-12.24z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>`,
    smartphone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`,
    monitor: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    server: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
    zap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    cloud: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`,
    database: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
    external: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    github: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    award: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
    download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
  };

  function getIcon(name) {
    return ICONS[name] || ICONS.code;
  }

  // Safe local Toast Helper inside app.js scope
  function showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `<span>✨</span> <span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    }
  }

  // Active state data
  let data = null;
  let activeSkillCategory = "All";
  let activeProjectCategory = "All";

  // Core Render Trigger
  function renderPortfolioUI(customData) {
    data = customData || (window.getWorkingData ? window.getWorkingData() : window.portfolioData);
    if (!data) return;

    renderDocumentMeta();
    renderHero();
    renderStats();
    renderSkills();
    renderProjects();
    renderExperience();
    renderCertifications();
    renderResume();
    renderContactInfo();
    renderFooter();
  }

  window.renderPortfolioUI = renderPortfolioUI;

  // 0. Dynamic Title & Brand Meta
  function renderDocumentMeta() {
    const p = data.personal || {};
    const name = p.name || 'Developer Portfolio';
    const title = p.title || 'Software Engineer';
    document.title = `${name} | ${title}`;

    const brandEl = document.getElementById('navbar-brand-name');
    if (brandEl) {
      const cleanName = (p.name || '').replace(/[^a-zA-Z0-9]/g, '');
      brandEl.textContent = `<${cleanName || 'Developer'} />`;
    }
  }

  // 1. Hero Render
  function renderHero() {
    const p = data.personal || {};
    const nameEl = document.getElementById('hero-name');
    if (nameEl) nameEl.innerText = p.name || 'Your Name';

    const titleEl = document.getElementById('hero-title');
    if (titleEl) titleEl.innerText = p.title || 'Professional Title';

    const bioEl = document.getElementById('hero-bio');
    if (bioEl) bioEl.innerText = p.bio || 'Add your bio summary in the settings customizer.';

    const locEl = document.getElementById('hero-location');
    if (locEl) locEl.innerText = p.location || 'Location';

    const availEl = document.getElementById('hero-availability');
    if (availEl) availEl.innerText = p.availability || 'Available for New Roles';
    
    const avatarImg = document.getElementById('hero-avatar');
    if (avatarImg) {
      avatarImg.src = p.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%231e293b"/></svg>';
      avatarImg.onerror = function() {
        this.onerror = null;
        this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%233b82f6' font-size='48' font-weight='bold'%3E" + encodeURIComponent(p.name ? p.name.charAt(0) : 'D') + "%3C/text%3E%3C/svg%3E";
      };
    }

    const githubLink = document.getElementById('hero-github');
    if (githubLink) {
      githubLink.href = p.github || '#';
      githubLink.style.display = p.github ? 'inline-flex' : 'none';
    }

    const linkedinLink = document.getElementById('hero-linkedin');
    if (linkedinLink) {
      linkedinLink.href = p.linkedin || '#';
      linkedinLink.style.display = p.linkedin ? 'inline-flex' : 'none';
    }
  }

  // 2. Stats Render
  function renderStats() {
    const container = document.getElementById('stats-grid');
    const statsSection = document.querySelector('.stats-section');
    if (!container) return;

    if (!data.stats || data.stats.length === 0) {
      if (statsSection) statsSection.style.display = 'none';
      return;
    }

    if (statsSection) statsSection.style.display = 'block';

    container.innerHTML = data.stats.map(s => `
      <div class="stat-card">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
        <div class="stat-subtext">${s.subtext || ''}</div>
      </div>
    `).join('');
  }

  let activeSkillsView = "grid";

  // 3. Skills Matrix & Interactive Tech Tree Render
  function renderSkills() {
    const tabsContainer = document.getElementById('skills-tabs');
    const gridContainer = document.getElementById('skills-grid');
    const treeContainer = document.getElementById('tech-tree-container');
    const controlsBar = document.getElementById('skills-controls-bar');
    if (!tabsContainer || !gridContainer) return;

    // View Switcher Buttons
    const gridBtn = document.getElementById('skills-view-grid-btn');
    const treeBtn = document.getElementById('skills-view-tree-btn');

    if (gridBtn && treeBtn) {
      gridBtn.onclick = () => {
        activeSkillsView = 'grid';
        gridBtn.classList.add('active');
        treeBtn.classList.remove('active');
        if (window.portfolioAudio) window.portfolioAudio.playClick();
        renderSkills();
      };
      treeBtn.onclick = () => {
        activeSkillsView = 'tree';
        treeBtn.classList.add('active');
        gridBtn.classList.remove('active');
        if (window.portfolioAudio) window.portfolioAudio.playClick();
        renderSkills();
      };
    }

    if (activeSkillsView === 'tree') {
      gridContainer.style.display = 'none';
      if (controlsBar) controlsBar.style.display = 'none';
      if (treeContainer) {
        treeContainer.style.display = 'block';
        renderTechTree();
      }
      return;
    } else {
      gridContainer.style.display = 'grid';
      if (controlsBar) controlsBar.style.display = 'flex';
      if (treeContainer) treeContainer.style.display = 'none';
    }

    const skillsData = data.skills || [];

    if (skillsData.length === 0 || skillsData.every(cat => !cat.items || cat.items.length === 0)) {
      tabsContainer.innerHTML = '';
      gridContainer.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1;">
          <div class="empty-icon">🛠️</div>
          <h3 class="empty-title">No Skills Added Yet</h3>
          <p class="empty-desc">Add your programming languages, frameworks, cloud tools, and competencies.</p>
          <button class="btn btn-primary" onclick="window.openItemEditor({ type: 'skill', mode: 'add' })">
            ${ICONS.plus} Add Your First Skill
          </button>
        </div>
      `;
      return;
    }

    const categories = ["All", ...skillsData.map(s => s.category).filter(Boolean)];
    if (!categories.includes(activeSkillCategory)) {
      activeSkillCategory = "All";
    }

    tabsContainer.innerHTML = categories.map(cat => `
      <button class="tab-btn ${cat === activeSkillCategory ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeSkillCategory = e.target.getAttribute('data-cat');
        renderSkills();
      });
    });

    const searchInput = document.getElementById('skills-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let itemsToDisplay = [];
    skillsData.forEach((group, cIdx) => {
      if (activeSkillCategory === "All" || group.category === activeSkillCategory) {
        (group.items || []).forEach((item, iIdx) => {
          if (!searchVal || item.name.toLowerCase().includes(searchVal) || (item.level && item.level.toLowerCase().includes(searchVal))) {
            itemsToDisplay.push({ item, cIdx, iIdx });
          }
        });
      }
    });

    if (itemsToDisplay.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1; padding: 2rem;">
          <p style="color: var(--text-muted);">No skills matching "<strong>${escapeHtml(searchVal)}</strong>".</p>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('skills-search').value = ''; renderSkills();">
            Clear Search
          </button>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = itemsToDisplay.map(({ item, cIdx, iIdx }) => `
      <div class="skill-card">
        <div class="skill-header">
          <div class="skill-name-group">
            <div class="skill-icon">${getIcon(item.icon)}</div>
            <div class="skill-name">${escapeHtml(item.name)}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="skill-level-badge">${item.level || 'Proficient'}</span>
            <div class="card-action-bar">
              <button class="card-action-btn edit" title="Edit Skill" onclick="window.openItemEditor({ type: 'skill', mode: 'edit', categoryIndex: ${cIdx}, index: ${iIdx}, item: window.getSkillItem(${cIdx}, ${iIdx}) })">
                ${ICONS.edit}
              </button>
              <button class="card-action-btn delete" title="Delete Skill" onclick="window.deleteItem('skill', ${iIdx}, ${cIdx})">
                ${ICONS.trash}
              </button>
            </div>
          </div>
        </div>
        <div class="skill-progress-bar">
          <div class="skill-progress-fill" style="width: ${item.proficiency || 85}%"></div>
        </div>
      </div>
    `).join('');
  }

  // Interactive Tech Tree Node Graph Renderer
  function renderTechTree() {
    const treeContainer = document.getElementById('tech-tree-container');
    if (!treeContainer) return;

    const tiers = [
      {
        id: 'tier-core',
        title: 'Tier 1: Core Logic & CS',
        skills: [
          { name: 'JavaScript (ES6+)', level: 'Advanced', projects: ['INK Attendance', 'Full Stack App'], relatesTo: ['React.js', 'Node.js'] },
          { name: 'HTML5 & CSS3', level: 'Advanced', projects: ['Responsive UI', 'Cross-Device'], relatesTo: ['Tailwind CSS', 'React.js'] },
          { name: 'Data Structures & Algorithms', level: 'Proficient', projects: ['Optimization', 'System Design'], relatesTo: ['OOPs & DBMS'] },
          { name: 'OOPs & DBMS', level: 'Proficient', projects: ['Schema Architecture'], relatesTo: ['MongoDB', 'Express.js'] }
        ]
      },
      {
        id: 'tier-frontend',
        title: 'Tier 2: Frontend Engineering',
        skills: [
          { name: 'React.js', level: 'Proficient', projects: ['INK Attendance', 'Full Stack App'], relatesTo: ['RESTful APIs', 'Tailwind CSS'] },
          { name: 'Tailwind CSS', level: 'Proficient', projects: ['INK Attendance', 'Modern UI'], relatesTo: ['Responsive UI Design'] },
          { name: 'Responsive UI Design', level: 'Proficient', projects: ['Mobile-First', 'Cross-Device'], relatesTo: ['React.js'] }
        ]
      },
      {
        id: 'tier-backend',
        title: 'Tier 3: Backend & Services',
        skills: [
          { name: 'Node.js', level: 'Proficient', projects: ['INK Attendance', 'REST APIs'], relatesTo: ['Express.js', 'MongoDB'] },
          { name: 'Express.js', level: 'Proficient', projects: ['REST Services', 'Routing'], relatesTo: ['Authentication (JWT)', 'RESTful APIs'] },
          { name: 'RESTful APIs', level: 'Proficient', projects: ['API Gateway', 'JSON Payloads'], relatesTo: ['Authentication (JWT)', 'Postman'] },
          { name: 'Authentication (JWT)', level: 'Proficient', projects: ['Session Guard', 'Token Auth'], relatesTo: ['MongoDB'] }
        ]
      },
      {
        id: 'tier-data',
        title: 'Tier 4: Data & DevOps',
        skills: [
          { name: 'MongoDB', level: 'Proficient', projects: ['INK Attendance', 'NoSQL Storage'], relatesTo: ['Mongoose ODM'] },
          { name: 'Mongoose ODM', level: 'Proficient', projects: ['Collection Validation'], relatesTo: ['MongoDB'] },
          { name: 'Git & GitHub', level: 'Advanced', projects: ['Version Control', 'CI/CD'], relatesTo: ['VS Code'] },
          { name: 'Postman', level: 'Proficient', projects: ['API Testing', 'Doc Automation'], relatesTo: ['RESTful APIs'] }
        ]
      }
    ];

    treeContainer.innerHTML = `
      <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.2rem;">Full-Stack Architectural Dependency Graph</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Hover or tap on any node to trace relational connections across tiers and discover projects powered by that technology.</p>
        </div>
        <span style="font-size: 0.75rem; color: var(--accent-primary); background: rgba(var(--accent-primary-rgb), 0.12); padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-weight: 600;">⚡ Interactive Tech Map</span>
      </div>
      <div class="tech-tree-swipe-hint">
        <span class="swipe-hand">👈</span>
        <span>Swipe horizontally to inspect all 4 architecture tiers</span>
        <span class="swipe-hand">👉</span>
      </div>
      <div class="tech-tree-grid">
        ${tiers.map(tier => `
          <div class="tree-column">
            <div class="tree-col-header">${tier.title}</div>
            ${tier.skills.map(s => `
              <div class="tree-node-card" data-skill-name="${escapeHtml(s.name)}" data-relates="${(s.relatesTo || []).join(',')}">
                <div class="tree-node-header">
                  <span class="tree-node-title">${escapeHtml(s.name)}</span>
                  <span class="tree-node-badge">${s.level}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-dim); margin-bottom: 0.35rem;">Projects Built:</div>
                <div class="tree-node-projects">
                  ${s.projects.map(proj => `<span class="tree-node-pill">${escapeHtml(proj)}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    `;

    const cards = treeContainer.querySelectorAll('.tree-node-card');
    cards.forEach(card => {
      // Mouse hover for desktop
      card.addEventListener('mouseenter', () => {
        if (window.portfolioAudio) window.portfolioAudio.playClick();
        const relatesStr = card.getAttribute('data-relates') || '';
        const relatedNames = relatesStr.split(',').filter(Boolean);
        relatedNames.push(card.getAttribute('data-skill-name'));

        cards.forEach(c => {
          const name = c.getAttribute('data-skill-name');
          if (relatedNames.includes(name)) {
            c.classList.add('highlighted');
            c.style.opacity = '1';
          } else {
            c.classList.remove('highlighted');
            c.style.opacity = '0.35';
          }
        });
      });

      card.addEventListener('mouseleave', () => {
        cards.forEach(c => {
          c.classList.remove('highlighted');
          c.style.opacity = '1';
        });
      });

      // Mobile Touch Tap Toggle
      card.addEventListener('click', () => {
        const isTap = card.classList.contains('active-tap');
        cards.forEach(c => {
          c.classList.remove('highlighted', 'active-tap');
          c.style.opacity = '1';
        });

        if (!isTap) {
          if (window.portfolioAudio) window.portfolioAudio.playClick();
          card.classList.add('active-tap');
          const relatesStr = card.getAttribute('data-relates') || '';
          const relatedNames = relatesStr.split(',').filter(Boolean);
          relatedNames.push(card.getAttribute('data-skill-name'));

          cards.forEach(c => {
            const name = c.getAttribute('data-skill-name');
            if (relatedNames.includes(name)) {
              c.classList.add('highlighted');
              c.style.opacity = '1';
            } else {
              c.classList.remove('highlighted');
              c.style.opacity = '0.35';
            }
          });
        }
      });
    });
  }

  // 4. Projects Showcase Render
  function renderProjects() {
    const filtersContainer = document.getElementById('project-filters');
    const gridContainer = document.getElementById('projects-grid');
    if (!filtersContainer || !gridContainer) return;

    const projectsData = data.projects || [];

    if (projectsData.length === 0) {
      filtersContainer.innerHTML = '';
      gridContainer.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1;">
          <div class="empty-icon">🚀</div>
          <h3 class="empty-title">No Projects Added Yet</h3>
          <p class="empty-desc">Showcase your applications, open source contributions, architecture blueprints, or client work.</p>
          <button class="btn btn-primary" onclick="window.openItemEditor({ type: 'project', mode: 'add' })">
            ${ICONS.plus} Add Your First Project
          </button>
        </div>
      `;
      return;
    }

    const rawCatList = projectsData.map(p => p.category).filter(Boolean);
    const categories = ["All", ...new Set(rawCatList)];

    if (!categories.includes(activeProjectCategory)) {
      activeProjectCategory = "All";
    }

    filtersContainer.innerHTML = categories.map(cat => `
      <button class="tab-btn ${cat === activeProjectCategory ? 'active' : ''}" data-pcat="${cat}">
        ${cat}
      </button>
    `).join('');

    filtersContainer.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeProjectCategory = e.target.getAttribute('data-pcat');
        renderProjects();
      });
    });

    const filteredWithIndex = projectsData
      .map((proj, originalIndex) => ({ proj, originalIndex }))
      .filter(({ proj }) => activeProjectCategory === "All" || proj.category === activeProjectCategory);

    gridContainer.innerHTML = filteredWithIndex.map(({ proj: p, originalIndex }) => `
      <div class="project-card" data-project-id="${p.id || originalIndex}">
        <div class="project-thumb-container">
          <img src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.title)}" class="project-thumb" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'800\\' height=\\'400\\'%3E%3Crect width=\\'800\\' height=\\'400\\' fill=\\'%230f172a\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%233b82f6\\' font-size=\\'24\\' font-weight=\\'bold\\'%3E${encodeURIComponent(p.title || 'Project')}%3C/text%3E%3C/svg%3E';" />
          <span class="project-category-badge">${escapeHtml(p.category || 'General')}</span>
          <div class="card-action-bar overlay">
            <button class="card-action-btn edit" title="Edit Project" onclick="event.stopPropagation(); window.openItemEditor({ type: 'project', mode: 'edit', index: ${originalIndex}, item: window.getProjectItem(${originalIndex}) })">
              ${ICONS.edit}
            </button>
            <button class="card-action-btn delete" title="Delete Project" onclick="event.stopPropagation(); window.deleteItem('project', ${originalIndex})">
              ${ICONS.trash}
            </button>
          </div>
        </div>
        <div class="project-body">
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          <p class="project-summary">${escapeHtml(p.summary || '')}</p>
          <div class="project-tech-tags">
            ${(p.techStack || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
          <div class="project-footer">
            <button class="btn btn-secondary view-project-btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" data-id="${p.id || originalIndex}" data-idx="${originalIndex}">
              Details & Architecture
            </button>
            <div class="project-links">
              ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="link-btn">${getIcon('github')} Code</a>` : ''}
              ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" class="link-btn">${getIcon('external')} Demo</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');

    gridContainer.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        openProjectModal(idx);
      });
    });

    init3DCardTilt();
  }

  // 3D Parallax Tilt & Specular Sheen Handler
  function init3DCardTilt() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--mouse-x', `${((x / rect.width) * 100).toFixed(1)}%`);
        card.style.setProperty('--mouse-y', `${((y / rect.height) * 100).toFixed(1)}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // Project Detail Modal with Tabs (Overview, Architecture Blueprint, Code Peek)
  function openProjectModal(index) {
    const p = data.projects[index];
    if (!p) return;

    const modal = document.getElementById('project-modal');
    const content = document.getElementById('project-modal-content');
    if (!modal || !content) return;

    if (window.portfolioAudio) window.portfolioAudio.playChime();

    const codeSnippet = (p.title || '').toLowerCase().includes('attendance') ? `// controllers/attendanceController.js
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

/**
 * Record daily employee attendance with sub-second response
 * POST /api/v1/attendance/check-in
 */
export const logDailyAttendance = async (req, res) => {
  try {
    const { userId, coordinates, deviceFingerprint } = req.body;
    
    // 1. Verify token user session
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized credentials' });
    }

    // 2. Prevent duplicate entries for current business day
    const today = new Date().setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({ userId, date: { $gte: today } });
    if (existing) {
      return res.status(409).json({ message: 'Attendance already recorded for today' });
    }

    // 3. Atomically record log with geo-verification
    const record = await Attendance.create({
      userId,
      timestamp: new Date(),
      status: 'PRESENT',
      geoVerified: Boolean(coordinates?.lat && coordinates?.lng),
      deviceHash: deviceFingerprint
    });

    return res.status(201).json({ success: true, record });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};` : `// routes/apiRouter.js
import express from 'express';
import { verifyJWT } from '../middleware/auth.js';
import { queryAggregates, createEntity } from '../controllers/dataController.js';

const router = express.Router();

/**
 * Centralized RESTful pipeline with JWT protection
 * Scalable microservice endpoint
 */
router.route('/v1/entities')
  .get(verifyJWT, queryAggregates)
  .post(verifyJWT, createEntity);

export default router;`;

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem;">
        <div>
          <span class="project-category-badge" style="position: static; display: inline-block; margin-bottom: 0.5rem;">${escapeHtml(p.category || 'General')}</span>
          <h2 style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; margin-bottom: 0.25rem;">${escapeHtml(p.title)}</h2>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="window.openItemEditor({ type: 'project', mode: 'edit', index: ${index}, item: window.getProjectItem(${index}) }); document.getElementById('project-modal').classList.remove('active');">
            ${ICONS.edit} Edit
          </button>
          <button class="btn btn-secondary btn-sm" style="color: #ef4444;" onclick="window.deleteItem('project', ${index}); document.getElementById('project-modal').classList.remove('active');">
            ${ICONS.trash} Delete
          </button>
        </div>
      </div>

      <!-- Modal Tabs Header -->
      <div class="modal-tabs-header">
        <button type="button" class="modal-tab-btn active" data-tab="tab-overview">Overview</button>
        <button type="button" class="modal-tab-btn" data-tab="tab-arch">🏛️ Architecture Blueprint</button>
        <button type="button" class="modal-tab-btn" data-tab="tab-code">💻 Code Peek</button>
      </div>

      <!-- Tab 1: Overview -->
      <div class="modal-tab-pane active" id="modal-tab-overview">
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem;">${escapeHtml(p.description || p.summary || '')}</p>

        <img src="${escapeHtml(p.image || '')}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 260px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1.5rem; border: 1px solid var(--border-color);" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'" />

        ${Array.isArray(p.techStack) && p.techStack.length > 0 ? `
          <div style="margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--accent-primary); letter-spacing: 0.05em; margin-bottom: 0.5rem;">Technologies Used</h4>
            <div class="project-tech-tags">
              ${p.techStack.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${Array.isArray(p.metrics) && p.metrics.length > 0 ? `
          <div style="margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--accent-primary); letter-spacing: 0.05em; margin-bottom: 0.5rem;">Key Achievements & Metrics</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem;">
              ${p.metrics.map(m => `<li style="font-size: 0.9rem; color: var(--text-muted); position: relative; padding-left: 1.2rem;"><span style="position: absolute; left: 0; color: var(--accent-primary);">⚡</span> ${escapeHtml(m)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>

      <!-- Tab 2: Architecture Blueprint -->
      <div class="modal-tab-pane" id="modal-tab-arch" style="display: none;">
        <div class="blueprint-flow-wrapper">
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); margin-bottom: 1rem; font-weight: 700;">
            Live Request-Response Pipeline (Packet Flow Simulation)
          </div>
          <div class="blueprint-nodes-row">
            <div class="blueprint-node">
              <div class="bp-icon">🖥️</div>
              <div class="bp-title">Client Browser</div>
              <div class="bp-tech">React.js SPA</div>
            </div>
            <div class="blueprint-arrow">
              <div class="blueprint-packet"></div>
            </div>
            <div class="blueprint-node">
              <div class="bp-icon">⚡</div>
              <div class="bp-title">API Gateway</div>
              <div class="bp-tech">Express.js Router</div>
            </div>
            <div class="blueprint-arrow">
              <div class="blueprint-packet" style="animation-delay: 0.6s;"></div>
            </div>
            <div class="blueprint-node">
              <div class="bp-icon">🔐</div>
              <div class="bp-title">Auth Guard</div>
              <div class="bp-tech">JWT Middleware</div>
            </div>
            <div class="blueprint-arrow">
              <div class="blueprint-packet" style="animation-delay: 1.2s;"></div>
            </div>
            <div class="blueprint-node">
              <div class="bp-icon">🗄️</div>
              <div class="bp-title">Database</div>
              <div class="bp-tech">MongoDB Cluster</div>
            </div>
          </div>
        </div>

        ${Array.isArray(p.architecture) && p.architecture.length > 0 ? `
          <div style="margin-bottom: 1.5rem; background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--accent-primary); letter-spacing: 0.05em; margin-bottom: 0.75rem;">System Architecture Specifications</h4>
            <ol style="padding-left: 1.2rem; font-size: 0.88rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.4rem;">
              ${p.architecture.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
      </div>

      <!-- Tab 3: Code Peek -->
      <div class="modal-tab-pane" id="modal-tab-code" style="display: none;">
        <div class="code-peek-wrapper">
          <div class="code-peek-header">
            <span class="code-peek-filename">controllers/handler.js • (MERN Architecture)</span>
            <button type="button" class="code-peek-copy-btn" id="code-copy-btn">📋 Copy Code</button>
          </div>
          <pre class="code-peek-pre"><code>${escapeHtml(codeSnippet)}</code></pre>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
        ${p.demoUrl ? `<a href="${p.demoUrl}" target="_blank" class="btn btn-primary">${getIcon('external')} Launch Live Demo</a>` : ''}
        ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="btn btn-secondary">${getIcon('github')} View Repository</a>` : ''}
      </div>
    `;

    // Modal Tabs Switching
    content.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        content.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
        content.querySelectorAll('.modal-tab-pane').forEach(p => p.style.display = 'none');

        btn.classList.add('active');
        const tabTarget = btn.getAttribute('data-tab');
        const pane = content.querySelector(`#modal-${tabTarget}`);
        if (pane) pane.style.display = 'block';
        if (window.portfolioAudio) window.portfolioAudio.playClick();
      });
    });

    // Copy Code button
    const copyBtn = content.querySelector('#code-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeSnippet).then(() => {
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => copyBtn.textContent = '📋 Copy Code', 2000);
          showToast('Code snippet copied to clipboard!');
        });
      });
    }

    modal.classList.add('active');
  }

  window.openProjectModalByIndex = openProjectModal;

  // 5. Work Experience Render
  function renderExperience() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const expData = data.experience || [];

    if (expData.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">💼</div>
          <h3 class="empty-title">No Experience Added Yet</h3>
          <p class="empty-desc">Add your work history, engineering leadership roles, and company milestones.</p>
          <button class="btn btn-primary" onclick="window.openItemEditor({ type: 'experience', mode: 'add' })">
            ${ICONS.plus} Add Work Experience
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = expData.map((e, idx) => `
      <div class="timeline-item">
        <div class="timeline-node">${escapeHtml(e.logo || (idx + 1))}</div>
        <div class="timeline-card">
          <div class="exp-header">
            <div>
              <h3 class="exp-role">${escapeHtml(e.role)}</h3>
              <div class="exp-company">${escapeHtml(e.company)} • ${escapeHtml(e.location || 'Remote')}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span class="exp-period">${escapeHtml(e.period)}</span>
              <div class="card-action-bar">
                <button class="card-action-btn edit" title="Edit Experience" onclick="window.openItemEditor({ type: 'experience', mode: 'edit', index: ${idx}, item: window.getExperienceItem(${idx}) })">
                  ${ICONS.edit}
                </button>
                <button class="card-action-btn delete" title="Delete Experience" onclick="window.deleteItem('experience', ${idx})">
                  ${ICONS.trash}
                </button>
              </div>
            </div>
          </div>
          <ul class="exp-bullets">
            ${(e.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  // 6. Certifications Render
  function renderCertifications() {
    const container = document.getElementById('cert-grid');
    if (!container) return;

    const certData = data.certifications || [];

    if (certData.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1;">
          <div class="empty-icon">📜</div>
          <h3 class="empty-title">No Certifications Added Yet</h3>
          <p class="empty-desc">Highlight your cloud certifications, technical accreditations, and achievements.</p>
          <button class="btn btn-primary" onclick="window.openItemEditor({ type: 'certification', mode: 'add' })">
            ${ICONS.plus} Add Certification
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = certData.map((c, idx) => `
      <div class="cert-card">
        <div class="cert-badge-header">
          <div class="cert-icon-box">${getIcon('award')}</div>
          <div style="flex: 1;">
            <div class="cert-title">${escapeHtml(c.title)}</div>
            <div class="cert-issuer">${escapeHtml(c.issuer)}</div>
          </div>
          <div class="card-action-bar">
            <button class="card-action-btn edit" title="Edit" onclick="window.openItemEditor({ type: 'certification', mode: 'edit', index: ${idx}, item: window.getCertificationItem(${idx}) })">
              ${ICONS.edit}
            </button>
            <button class="card-action-btn delete" title="Delete" onclick="window.deleteItem('certification', ${idx})">
              ${ICONS.trash}
            </button>
          </div>
        </div>
        <div class="project-tech-tags">
          ${(c.skills || []).map(s => `<span class="tech-tag">${escapeHtml(s)}</span>`).join('')}
        </div>
        <div class="cert-meta">
          <span>Issued: ${escapeHtml(c.issueDate || 'Verified')}</span>
          ${c.verifyUrl ? `<a href="${c.verifyUrl}" target="_blank" style="color: var(--accent-primary); text-decoration: none;">Verify ↗</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // 7. Resume Render
  function renderResume() {
    const container = document.getElementById('resume-preview-content');
    const badgeEl = document.getElementById('resume-active-badge');
    if (!container) return;

    const p = data.personal || {};
    const exp = data.experience || [];
    const skills = data.skills || [];
    const certs = data.certifications || [];
    const edu = data.education || p.education || [];

    const hasPdf = Boolean(p.resumePdf || (p.resumeUrl && p.resumeUrl !== '#'));
    const pdfName = p.resumeFileName || (hasPdf ? 'Official_Resume.pdf' : '');

    if (badgeEl) {
      if (hasPdf) {
        badgeEl.className = 'resume-active-badge';
        badgeEl.innerHTML = `📄 ${escapeHtml(pdfName || 'Active PDF Document')}`;
        badgeEl.style.display = 'inline-flex';
      } else {
        badgeEl.className = 'resume-active-badge inactive';
        badgeEl.innerHTML = `📄 Interactive CV Ready`;
        badgeEl.style.display = 'inline-flex';
      }
    }

    container.innerHTML = `
      <div class="resume-sheet">
        <div class="resume-sheet-header">
          <h2 class="resume-name">${escapeHtml(p.name || 'Your Name')}</h2>
          <div class="resume-title">${escapeHtml(p.title || 'Software Engineer')}</div>
          <div class="resume-contact-line">
            ${p.email ? `<span>✉️ ${escapeHtml(p.email)}</span>` : ''}
            ${p.phone ? `<span>📞 ${escapeHtml(p.phone)}</span>` : ''}
            ${p.location ? `<span>📍 ${escapeHtml(p.location)}</span>` : ''}
            ${p.github ? `<span>🔗 ${escapeHtml(p.github)}</span>` : ''}
            ${p.linkedin ? `<span>💼 ${escapeHtml(p.linkedin)}</span>` : ''}
          </div>
        </div>

        <div class="resume-section">
          <h4 class="resume-section-heading">Executive Summary</h4>
          <p class="resume-text">${escapeHtml(p.bio || p.summary || 'Professional software engineer summary.')}</p>
        </div>

        ${skills.length > 0 ? `
          <div class="resume-section">
            <h4 class="resume-section-heading">Core Competencies & Technologies</h4>
            <div class="resume-skills-block">
              ${skills.map(g => `<div><strong>${escapeHtml(g.category)}:</strong> ${(g.items || []).map(i => escapeHtml(i.name)).join(', ')}</div>`).join('')}
            </div>
          </div>
        ` : ''}

        ${exp.length > 0 ? `
          <div class="resume-section">
            <h4 class="resume-section-heading">Professional Experience</h4>
            ${exp.map(e => `
              <div class="resume-item">
                <div class="resume-item-top">
                  <strong>${escapeHtml(e.role)} — <span class="resume-company">${escapeHtml(e.company)}</span></strong>
                  <span class="resume-date">${escapeHtml(e.period)}</span>
                </div>
                ${e.location ? `<div class="resume-sub">${escapeHtml(e.location)}</div>` : ''}
                <ul class="resume-bullets">
                  ${(e.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${edu.length > 0 ? `
          <div class="resume-section">
            <h4 class="resume-section-heading">Education</h4>
            ${edu.map(ed => `
              <div class="resume-item">
                <div class="resume-item-top">
                  <strong>${escapeHtml(ed.degree)} — ${escapeHtml(ed.institution)}</strong>
                  <span class="resume-date">${escapeHtml(ed.year || '')}</span>
                </div>
                ${ed.details ? `<div class="resume-sub">${escapeHtml(ed.details)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${certs.length > 0 ? `
          <div class="resume-section">
            <h4 class="resume-section-heading">Certifications & Credentials</h4>
            <ul class="resume-bullets">
              ${certs.map(c => `<li><strong>${escapeHtml(c.title)}</strong> (${escapeHtml(c.issuer)}${c.issueDate ? `, ${escapeHtml(c.issueDate)}` : ''})</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  // 8. Contact Info Render
  function renderContactInfo() {
    const p = data.personal || {};
    const emailEl = document.getElementById('contact-email-val');
    if (emailEl) emailEl.innerText = p.email || 'Not provided';

    const phoneEl = document.getElementById('contact-phone-val');
    if (phoneEl) phoneEl.innerText = p.phone || 'Not provided';

    const locEl = document.getElementById('contact-loc-val');
    if (locEl) locEl.innerText = p.location || 'Not provided';
  }

  // 9. Footer Render
  function renderFooter() {
    const footerEl = document.getElementById('footer-copyright');
    if (footerEl) {
      const year = new Date().getFullYear();
      const name = data.personal?.name || 'Developer';
      footerEl.innerHTML = `© ${year} ${escapeHtml(name)}. Engineered with HTML5, Vanilla CSS & Modern JavaScript.`;
    }
  }

  // Contact Form Submission & Draft Save
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const savedDraft = localStorage.getItem('contact_form_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.name) document.getElementById('contact-name').value = draft.name;
        if (draft.email) document.getElementById('contact-email').value = draft.email;
        if (draft.message) document.getElementById('contact-msg').value = draft.message;
      } catch (e) {}
    }

    form.addEventListener('input', () => {
      const draft = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        message: document.getElementById('contact-msg').value
      };
      localStorage.setItem('contact_form_draft', JSON.stringify(draft));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const msg = document.getElementById('contact-msg').value;

      if (!name || !email || !msg) {
        showToast('Please fill in all required fields.');
        return;
      }

      showToast(`Thank you, ${name}! Your message has been received.`);
      localStorage.removeItem('contact_form_draft');
      form.reset();
    });
  }

  // Theme & Accent Switcher
  function initThemeController() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('theme_preference') || 'dark';

    document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme_preference', nextTheme);
        showToast(`Switched to ${nextTheme} mode`);
      });
    }

    // Accent Buttons
    document.querySelectorAll('.accent-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const accent = e.target.getAttribute('data-accent-val');
        document.documentElement.setAttribute('data-accent', accent);
        localStorage.setItem('accent_preference', accent);
        showToast(`Accent color set to ${accent}`);
      });
    });

    const savedAccent = localStorage.getItem('accent_preference');
    if (savedAccent) {
      document.documentElement.setAttribute('data-accent', savedAccent);
    }
  }

  // Global Listeners & Modals
  function initModals() {
    const closeBtns = document.querySelectorAll('.modal-close-btn');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
      });
    });

    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('active');
      }
    });

    const skillsSearch = document.getElementById('skills-search');
    if (skillsSearch) {
      skillsSearch.addEventListener('input', () => {
        renderSkills();
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 10. Collaboration Scope & Budget Estimator
  function initScopeEstimator() {
    const scopeContainer = document.querySelector('.scope-estimator-container');
    if (!scopeContainer) return;

    let selectedScope = 'Full-Stack MERN Application';
    let targetWeeks = 4;
    let selectedFeatures = [
      'User Auth & JWT Session Security',
      'MongoDB Aggregations & Schema Design',
      'RESTful API Endpoints & CRUD',
      'Mobile-First Responsive Tailwind Design'
    ];

    const scopeBtns = scopeContainer.querySelectorAll('#scope-type-options .scope-btn');
    const slider = document.getElementById('estimator-timeline-slider');
    const weeksBadge = document.getElementById('estimator-weeks-badge');
    const summaryScope = document.getElementById('summary-scope-val');
    const summaryTimeline = document.getElementById('summary-timeline-val');
    const summaryTechPills = document.getElementById('summary-tech-pills');
    const featureCheckboxes = document.querySelectorAll('#estimator-features-grid input');
    const applyBtn = document.getElementById('estimator-apply-btn');

    function updateSummary() {
      if (summaryScope) summaryScope.textContent = selectedScope;
      if (summaryTimeline) summaryTimeline.textContent = `~${targetWeeks} Weeks`;
      if (weeksBadge) weeksBadge.textContent = `${targetWeeks} Weeks`;

      const stack = ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'];
      if (selectedFeatures.some(f => f.includes('WebSockets'))) {
        stack.push('Socket.io');
      }
      if (selectedFeatures.some(f => f.includes('Dashboard'))) {
        stack.push('Chart.js');
      }
      if (selectedFeatures.some(f => f.includes('Auth'))) {
        stack.push('JWT & Bcrypt');
      }

      if (summaryTechPills) {
        summaryTechPills.innerHTML = [...new Set(stack)].map(t => `<span>${t}</span>`).join(' ');
      }
    }

    scopeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        scopeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedScope = btn.getAttribute('data-type');
        const defaultWeeks = parseInt(btn.getAttribute('data-weeks'), 10) || 4;
        if (slider) {
          slider.value = defaultWeeks;
          targetWeeks = defaultWeeks;
        }
        if (window.portfolioAudio) window.portfolioAudio.playClick();
        updateSummary();
      });
    });

    if (slider) {
      slider.addEventListener('input', (e) => {
        targetWeeks = parseInt(e.target.value, 10);
        updateSummary();
      });
    }

    featureCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const label = cb.closest('.feature-tag');
        if (cb.checked) {
          label.classList.add('checked');
        } else {
          label.classList.remove('checked');
        }

        selectedFeatures = Array.from(featureCheckboxes)
          .filter(c => c.checked)
          .map(c => c.value);

        if (window.portfolioAudio) window.portfolioAudio.playClick();
        updateSummary();
      });
    });

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const msgField = document.getElementById('contact-msg');
        if (!msgField) return;

        const generatedMessage = `Hi Rakesh,

I would like to discuss collaborating with you on a project:
• Target Scope: ${selectedScope}
• Estimated Timeline: ${targetWeeks} Weeks
• Key Architectural Modules:
${selectedFeatures.map(f => `  - ${f}`).join('\n')}
• Preferred Tech Stack: React.js, Node.js, Express, MongoDB

Let's connect to discuss milestones and project kickoff!`;

        msgField.value = generatedMessage;

        const form = document.getElementById('contact-form');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth' });
          msgField.focus();
        }

        if (window.portfolioAudio) window.portfolioAudio.playChime();
        showToast('Scope plan applied to your message draft! 🚀');
      });
    }

    updateSummary();
  }

  // 11. Real-Time Bengaluru Local Time Widget
  function initBengaluruClock() {
    const clockEl = document.getElementById('blr-clock-val');
    const badgeEl = document.getElementById('blr-status-badge');
    if (!clockEl) return;

    function tick() {
      // Calculate IST (UTC +5:30)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (3600000 * 5.5));

      let hours = istDate.getHours();
      const minutes = String(istDate.getMinutes()).padStart(2, '0');
      const seconds = String(istDate.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;

      clockEl.textContent = `${displayHours}:${minutes}:${seconds} ${ampm} IST`;

      if (badgeEl) {
        if (hours >= 9 && hours < 22) {
          badgeEl.textContent = '🟢 Available / Coding Now';
          badgeEl.style.color = '#10b981';
        } else {
          badgeEl.textContent = '🌙 Offline / Recharging (Response <4h)';
          badgeEl.style.color = '#f59e0b';
        }
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  // 12. Custom Magnetic Fluid Cursor
  function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    const interactiveSelector = 'a, button, input, textarea, select, .project-card, .skill-card, .tree-node-card, .accent-dot, .palette-item, .hud-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        ring.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        ring.classList.remove('hovering');
      }
    });
  }

  // 13. Konami Code Easter Egg (Developer God Mode)
  function initKonamiCode() {
    const konamiSequence = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'b', 'a'
    ];
    let konamiIndex = 0;

    window.addEventListener('keydown', (e) => {
      const key = e.key;
      const expected = konamiSequence[konamiIndex];

      if (key.toLowerCase() === expected.toLowerCase()) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          konamiIndex = 0;
          triggerGodMode();
        }
      } else {
        konamiIndex = 0;
      }
    });

    function triggerGodMode() {
      document.documentElement.setAttribute('data-accent', 'gold');
      localStorage.setItem('accent_preference', 'gold');

      if (window.portfolioAudio) {
        window.portfolioAudio.playCelebration();
      }

      if (typeof window.triggerCelebrationFireworks === 'function') {
        window.triggerCelebrationFireworks();
      }

      showToast('🏆 Developer God Mode Unlocked! Gold Theme & Fireworks Engaged! ⚡');
    }
  }

  // 14. Mobile Navigation Drawer Controller
  function initMobileNavigation() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const drawer = document.getElementById('mobile-nav-drawer');
    const closeBtn = document.getElementById('mobile-nav-close-btn');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    const mobileLinks = document.querySelectorAll('.mobile-nav-item');
    const mobileThemeBtn = document.getElementById('mobile-theme-btn');
    const mobileAudioBtn = document.getElementById('mobile-audio-btn');

    function openMobileNav() {
      if (!drawer) return;
      drawer.classList.add('active');
      drawer.setAttribute('aria-hidden', 'false');
      if (menuBtn) menuBtn.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (window.portfolioAudio) window.portfolioAudio.playClick();
    }

    function closeMobileNav() {
      if (!drawer) return;
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      if (menuBtn) menuBtn.classList.remove('active');
      document.body.style.overflow = '';
    }

    window.openMobileNav = openMobileNav;
    window.closeMobileNav = closeMobileNav;

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        if (drawer && drawer.classList.contains('active')) {
          closeMobileNav();
        } else {
          openMobileNav();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMobileNav);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileNav);
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    if (mobileThemeBtn) {
      mobileThemeBtn.addEventListener('click', () => {
        const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('theme_preference', nextTheme);
        showToast(`Switched to ${nextTheme} mode`);
        if (window.portfolioAudio) window.portfolioAudio.playClick();
      });
    }

    if (mobileAudioBtn) {
      mobileAudioBtn.addEventListener('click', () => {
        if (window.portfolioAudio && typeof window.portfolioAudio.toggleMute === 'function') {
          const isMuted = window.portfolioAudio.toggleMute();
          showToast(isMuted ? 'Sound FX Muted 🔇' : 'Sound FX Enabled 🔊');
        }
      });
    }
  }

  // Safe DOM Content Loaded / Ready Handler
  function bootApp() {
    renderPortfolioUI();
    initContactForm();
    initThemeController();
    initModals();
    initScopeEstimator();
    initBengaluruClock();
    initCustomCursor();
    initKonamiCode();
    initMobileNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootApp);
  } else {
    bootApp();
  }
})();
