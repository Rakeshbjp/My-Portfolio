/**
 * ============================================================================
 * LIVE PORTFOLIO CONTENT & DATA MANAGER
 * ============================================================================
 * Enables full CRUD customization for all portfolio sections:
 * Profile, Skills, Projects, Experience, Certifications, Education, and Resume PDF.
 * Persists all changes permanently to localStorage across browser reloads & reopens.
 * ============================================================================
 */

(function () {
  const ALL_STORAGE_KEYS = [
    'portfolio_user_data_v2',
    'portfolio_user_data_v1',
    'portfolio_user_data',
    'portfolio_data',
    'portfolio_custom_data'
  ];

  function showToast(msg) {
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

  window.showToast = showToast;

  // 1. Data Retrieval & Persistence Single Source of Truth
  function getWorkingData() {
    let parsed = null;

    // Check all storage keys in priority order to guarantee zero data loss
    for (const key of ALL_STORAGE_KEYS) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const test = JSON.parse(stored);
          if (test && typeof test === 'object' && test.personal) {
            parsed = test;
            break;
          }
        }
      } catch (e) {}
    }

    if (parsed) {
      parsed.personal = parsed.personal || {};
      if (Array.isArray(parsed.stats)) {
        parsed.stats = parsed.stats.filter(s => 
          s && s.label !== 'Years Experience' && 
          s.label !== 'Production Systems' && 
          s.label !== 'System Uptime' && 
          s.label !== 'Monthly Active Users'
        );
      } else {
        parsed.stats = [];
      }
      parsed.skills = Array.isArray(parsed.skills) ? parsed.skills : [];
      parsed.projects = Array.isArray(parsed.projects) ? parsed.projects : [];
      parsed.experience = Array.isArray(parsed.experience) ? parsed.experience : [];
      parsed.certifications = Array.isArray(parsed.certifications) ? parsed.certifications : [];
      parsed.education = Array.isArray(parsed.education) ? parsed.education : [];

      // Auto-sync forward to all storage keys permanently
      try {
        const serialized = JSON.stringify(parsed);
        for (const k of ALL_STORAGE_KEYS) {
          localStorage.setItem(k, serialized);
        }
      } catch (e) {}
      return parsed;
    }

    // Fallback to default portfolioData from data.js
    const initial = window.portfolioData ? JSON.parse(JSON.stringify(window.portfolioData)) : getEmptyTemplate();
    initial.education = initial.education || [];
    try {
      const serialized = JSON.stringify(initial);
      for (const k of ALL_STORAGE_KEYS) {
        localStorage.setItem(k, serialized);
      }
    } catch (e) {}
    return initial;
  }

  function getEmptyTemplate() {
    return {
      personal: {
        name: "Your Name",
        title: "Your Professional Title",
        tagline: "Brief description of your expertise and goals.",
        location: "City, Country",
        email: "your.email@example.com",
        phone: "",
        availability: "Available for New Opportunities",
        bio: "Write a short bio introducing yourself, your experience, and your technical focus.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        resumeUrl: "#",
        resumePdf: "",
        resumeFileName: "",
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com"
      },
      stats: [],
      skills: [],
      projects: [],
      experience: [],
      certifications: [],
      education: []
    };
  }

  function saveWorkingData(data, message) {
    try {
      const serialized = JSON.stringify(data);
      for (const k of ALL_STORAGE_KEYS) {
        localStorage.setItem(k, serialized);
      }
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
      showToast('⚠️ Storage limit reached! Please use an external PDF URL if file is very large.');
    }
    
    window.portfolioData = data;
    window.defaultPortfolioData = JSON.parse(JSON.stringify(data));

    // Auto-sync directly to disk (js/data.js) via local server
    try {
      fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()).then(resp => {
        if (resp && resp.success) {
          console.log('💾 Successfully synchronized to disk (js/data.js)');
        }
      }).catch(err => {
        // Graceful fallback for static/offline hosting
      });
    } catch (err) {}

    if (typeof window.renderPortfolioUI === 'function') {
      window.renderPortfolioUI(data);
    }

    renderDrawerTabsContent();
    populateDrawerResumeForm();
    showToast(message || '✅ Portfolio updated & saved permanently!');
  }

  // 2. Clear All Demo Data & Reset Actions
  function clearAllDemoData(force = false) {
    if (force || confirm('Are you sure you want to remove all demo data? This will clear sample projects, skills, experience, and certifications so you can add your own from scratch.')) {
      const current = getWorkingData();
      const cleanData = {
        personal: {
          name: current.personal?.name || "Your Name",
          title: current.personal?.title || "Your Professional Title",
          tagline: "Ready to build innovative solutions.",
          location: current.personal?.location || "Your Location",
          email: current.personal?.email || "",
          phone: current.personal?.phone || "",
          availability: "Available for Hire / Contract",
          bio: current.personal?.bio || "Add your personal summary and career journey here.",
          avatar: current.personal?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
          resumeUrl: current.personal?.resumeUrl || "#",
          resumePdf: current.personal?.resumePdf || "",
          resumeFileName: current.personal?.resumeFileName || "",
          github: current.personal?.github || "",
          linkedin: current.personal?.linkedin || "",
          twitter: current.personal?.twitter || ""
        },
        stats: [],
        skills: [],
        projects: [],
        experience: [],
        certifications: [],
        education: []
      };

      saveWorkingData(cleanData, '🗑️ Demo data removed! Ready for your custom details.');
      populateDrawerProfileForm();
    }
  }

  function restoreDemoData(force = false) {
    if (force || confirm('Restore the default sample data? Any unsaved edits will be replaced.')) {
      const defaultData = window.defaultPortfolioData || window.portfolioData;
      if (defaultData) {
        saveWorkingData(JSON.parse(JSON.stringify(defaultData)), '⚡ Default sample data restored!');
        populateDrawerProfileForm();
      }
    }
  }

  // 3. Item Add, Edit, Delete Management
  let currentEditorContext = null;

  function openItemEditor(context) {
    currentEditorContext = context;
    const modal = document.getElementById('item-editor-modal');
    const titleEl = document.getElementById('item-editor-title');
    const formEl = document.getElementById('item-editor-form');

    if (!modal || !formEl) return;

    const { type, mode, item } = context;
    const isEdit = mode === 'edit';
    const typeNames = {
      skill: 'Skill',
      project: 'Project',
      experience: 'Work Experience',
      certification: 'Certification & Badge',
      education: 'Education Degree / College',
      stat: 'Stat Counter'
    };

    titleEl.textContent = `${isEdit ? '✏️ Edit' : '+ Add New'} ${typeNames[type] || 'Item'}`;
    formEl.innerHTML = renderEditorFormFields(type, item || {});

    // Hook up dynamic events (e.g. image file picker preview)
    const imgFileInput = document.getElementById('edit-item-img-file');
    if (imgFileInput) {
      imgFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            const base64 = evt.target.result;
            const urlInput = document.getElementById('edit-item-img-url');
            const previewEl = document.getElementById('edit-item-img-preview');
            if (urlInput) urlInput.value = base64;
            if (previewEl) previewEl.src = base64;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const imgUrlInput = document.getElementById('edit-item-img-url');
    if (imgUrlInput) {
      imgUrlInput.addEventListener('input', function () {
        const previewEl = document.getElementById('edit-item-img-preview');
        if (previewEl && this.value) {
          previewEl.src = this.value;
        }
      });
    }

    modal.classList.add('active');
  }

  function renderEditorFormFields(type, data) {
    if (type === 'skill') {
      const dataObj = getWorkingData();
      const existingCategories = (dataObj.skills || []).map(s => s.category).filter(Boolean);
      const uniqueCats = Array.from(new Set(existingCategories));

      return `
        <div class="form-group">
          <label>Skill / Technology Name *</label>
          <input type="text" id="edit-skill-name" class="form-control" value="${escapeHtml(data.name || '')}" placeholder="e.g. React, Python, Docker, AWS" required />
        </div>
        <div class="form-group">
          <label>Skill Category</label>
          <input type="text" id="edit-skill-category" class="form-control" list="category-suggestions" value="${escapeHtml(data.category || (uniqueCats[0] || 'Core Technologies'))}" placeholder="e.g. Frontend & Mobile, Backend & Systems" required />
          <datalist id="category-suggestions">
            ${uniqueCats.map(c => `<option value="${escapeHtml(c)}"></option>`).join('')}
            <option value="Languages & Core"></option>
            <option value="Frontend & Mobile"></option>
            <option value="Backend & Systems"></option>
            <option value="Cloud, DevOps & Databases"></option>
            <option value="AI & Machine Learning"></option>
            <option value="Tools & Frameworks"></option>
          </datalist>
        </div>
        <div class="form-group">
          <label>Proficiency Level (1 - 100%): <strong id="skill-level-display">${data.proficiency || 85}%</strong></label>
          <input type="range" id="edit-skill-level" min="10" max="100" value="${data.proficiency || 85}" class="form-range" style="width: 100%;" oninput="document.getElementById('skill-level-display').innerText = this.value + '%'" />
        </div>
        <div class="form-group">
          <label>Level Description</label>
          <select id="edit-skill-badge" class="form-control">
            <option value="Expert" ${data.level === 'Expert' ? 'selected' : ''}>Expert</option>
            <option value="Advanced" ${data.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
            <option value="Proficient" ${data.level === 'Proficient' || !data.level ? 'selected' : ''}>Proficient</option>
            <option value="Intermediate" ${data.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
          </select>
        </div>
      `;
    }

    if (type === 'project') {
      const defaultImg = data.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80";
      const techTags = Array.isArray(data.techStack) ? data.techStack.join(', ') : (data.techStack || '');
      const metricsText = Array.isArray(data.metrics) ? data.metrics.join('\n') : (data.metrics || '');
      const archText = Array.isArray(data.architecture) ? data.architecture.join('\n') : (data.architecture || '');

      return `
        <div class="form-group">
          <label>Project Title *</label>
          <input type="text" id="edit-proj-title" class="form-control" value="${escapeHtml(data.title || '')}" placeholder="e.g. AI-Powered Dashboard" required />
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" id="edit-proj-category" class="form-control" value="${escapeHtml(data.category || 'Full Stack')}" placeholder="e.g. Full Stack, Cloud / DevOps, AI / ML, Mobile" required />
        </div>
        <div class="form-group">
          <label>Featured Project (Highlights on top)</label>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
            <input type="checkbox" id="edit-proj-featured" ${data.featured ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;" />
            <label for="edit-proj-featured" style="cursor: pointer; font-size: 0.9rem;">Mark as Featured Project</label>
          </div>
        </div>
        <div class="form-group">
          <label>Project Cover Image</label>
          <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
            <img id="edit-item-img-preview" src="${defaultImg}" style="width: 90px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" alt="Preview" />
            <button type="button" class="btn btn-secondary" style="font-size: 0.8rem;" onclick="document.getElementById('edit-item-img-file').click()">
              📁 Upload Image File
            </button>
            <input type="file" id="edit-item-img-file" accept="image/*" style="display: none;" />
          </div>
          <input type="text" id="edit-item-img-url" class="form-control" value="${escapeHtml(defaultImg)}" placeholder="Or paste image URL (https://...)" />
        </div>
        <div class="form-group">
          <label>Summary (1-2 sentences for card) *</label>
          <textarea id="edit-proj-summary" class="form-control" rows="2" placeholder="Short description of what the project accomplishes..." required>${escapeHtml(data.summary || '')}</textarea>
        </div>
        <div class="form-group">
          <label>Detailed Description</label>
          <textarea id="edit-proj-desc" class="form-control" rows="3" placeholder="Full overview of architecture, features, and results...">${escapeHtml(data.description || '')}</textarea>
        </div>
        <div class="form-group">
          <label>Technologies Used (comma separated)</label>
          <input type="text" id="edit-proj-tech" class="form-control" value="${escapeHtml(techTags)}" placeholder="e.g. React, TypeScript, Node.js, AWS, PostgreSQL" />
        </div>
        <div class="form-group">
          <label>Key Metrics / Achievements (1 per line)</label>
          <textarea id="edit-proj-metrics" class="form-control" rows="2" placeholder="e.g. Reduced latency by 50%&#10;Handled 100k+ daily users">${escapeHtml(metricsText)}</textarea>
        </div>
        <div class="form-group">
          <label>Architecture Highlights (1 per line)</label>
          <textarea id="edit-proj-arch" class="form-control" rows="2" placeholder="e.g. Event-driven Kafka stream processing&#10;Next.js SSR edge rendering">${escapeHtml(archText)}</textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label>Live Demo URL</label>
            <input type="url" id="edit-proj-demo" class="form-control" value="${escapeHtml(data.demoUrl || '')}" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label>GitHub Repository URL</label>
            <input type="url" id="edit-proj-github" class="form-control" value="${escapeHtml(data.githubUrl || '')}" placeholder="https://github.com/..." />
          </div>
        </div>
      `;
    }

    if (type === 'experience') {
      const highlightsText = Array.isArray(data.highlights) ? data.highlights.join('\n') : (data.highlights || '');

      return `
        <div class="form-group">
          <label>Job Title / Role *</label>
          <input type="text" id="edit-exp-role" class="form-control" value="${escapeHtml(data.role || '')}" placeholder="e.g. Senior Software Engineer" required />
        </div>
        <div class="form-group">
          <label>Company / Organization *</label>
          <input type="text" id="edit-exp-company" class="form-control" value="${escapeHtml(data.company || '')}" placeholder="e.g. Google, Microsoft, Tech Corp" required />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label>Location</label>
            <input type="text" id="edit-exp-loc" class="form-control" value="${escapeHtml(data.location || '')}" placeholder="e.g. Bengaluru, India (Remote)" />
          </div>
          <div class="form-group">
            <label>Time Period *</label>
            <input type="text" id="edit-exp-period" class="form-control" value="${escapeHtml(data.period || '')}" placeholder="e.g. 2022 - Present" required />
          </div>
        </div>
        <div class="form-group">
          <label>Key Responsibilities & Achievements (1 bullet per line)</label>
          <textarea id="edit-exp-highlights" class="form-control" rows="4" placeholder="Engineered scalable backend microservices&#10;Led team of 5 engineers to deliver core product&#10;Optimized database query performance by 40%">${escapeHtml(highlightsText)}</textarea>
        </div>
      `;
    }

    if (type === 'certification') {
      const skillsText = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '');

      return `
        <div class="form-group">
          <label>Certification Name *</label>
          <input type="text" id="edit-cert-title" class="form-control" value="${escapeHtml(data.title || '')}" placeholder="e.g. AWS Certified Solutions Architect" required />
        </div>
        <div class="form-group">
          <label>Issuing Organization *</label>
          <input type="text" id="edit-cert-issuer" class="form-control" value="${escapeHtml(data.issuer || '')}" placeholder="e.g. Amazon Web Services, CNCF, Google" required />
        </div>
        <div class="form-group">
          <label>Issue Date</label>
          <input type="text" id="edit-cert-date" class="form-control" value="${escapeHtml(data.issueDate || '')}" placeholder="e.g. Nov 2023, 2024" />
        </div>
        <div class="form-group">
          <label>Skills / Topics (comma separated)</label>
          <input type="text" id="edit-cert-skills" class="form-control" value="${escapeHtml(skillsText)}" placeholder="e.g. AWS, Cloud, Kubernetes" />
        </div>
        <div class="form-group">
          <label>Verification URL / Credential Link</label>
          <input type="url" id="edit-cert-url" class="form-control" value="${escapeHtml(data.verifyUrl || '')}" placeholder="https://..." />
        </div>
      `;
    }

    if (type === 'education') {
      return `
        <div class="form-group">
          <label>Degree / Qualification *</label>
          <input type="text" id="edit-edu-degree" class="form-control" value="${escapeHtml(data.degree || '')}" placeholder="e.g. B.Tech in Computer Science" required />
        </div>
        <div class="form-group">
          <label>University / College / Institution *</label>
          <input type="text" id="edit-edu-inst" class="form-control" value="${escapeHtml(data.institution || '')}" placeholder="e.g. Stanford University, VTU" required />
        </div>
        <div class="form-group">
          <label>Graduation Year / Period</label>
          <input type="text" id="edit-edu-year" class="form-control" value="${escapeHtml(data.year || '')}" placeholder="e.g. 2018 - 2022" />
        </div>
        <div class="form-group">
          <label>Grade / CGPA / Details</label>
          <input type="text" id="edit-edu-details" class="form-control" value="${escapeHtml(data.details || '')}" placeholder="e.g. First Class with Distinction, 8.8 CGPA" />
        </div>
      `;
    }

    return '';
  }

  function handleEditorFormSubmit(e) {
    e.preventDefault();
    if (!currentEditorContext) return;

    const dataObj = getWorkingData();
    const { type, mode, index, categoryIndex } = currentEditorContext;
    const isEdit = mode === 'edit';

    if (type === 'skill') {
      const name = document.getElementById('edit-skill-name').value.trim();
      const category = document.getElementById('edit-skill-category').value.trim() || 'Core Technologies';
      const proficiency = parseInt(document.getElementById('edit-skill-level').value, 10) || 85;
      const level = document.getElementById('edit-skill-badge').value;

      const skillItem = {
        name,
        category,
        proficiency,
        level,
        icon: 'code'
      };

      if (isEdit) {
        if (categoryIndex !== undefined && index !== undefined && dataObj.skills[categoryIndex]?.items[index]) {
          dataObj.skills[categoryIndex].items.splice(index, 1);
          if (dataObj.skills[categoryIndex].items.length === 0) {
            dataObj.skills.splice(categoryIndex, 1);
          }
        }
      }

      let catGroup = (dataObj.skills || []).find(s => s.category.toLowerCase() === category.toLowerCase());
      if (!catGroup) {
        catGroup = { category, items: [] };
        dataObj.skills.push(catGroup);
      }
      catGroup.items.push(skillItem);
    }

    if (type === 'project') {
      const title = document.getElementById('edit-proj-title').value.trim();
      const category = document.getElementById('edit-proj-category').value.trim() || 'Full Stack';
      const featured = document.getElementById('edit-proj-featured').checked;
      const image = document.getElementById('edit-item-img-url').value.trim() || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80";
      const summary = document.getElementById('edit-proj-summary').value.trim();
      const description = document.getElementById('edit-proj-desc').value.trim();
      const techStack = document.getElementById('edit-proj-tech').value.split(',').map(s => s.trim()).filter(Boolean);
      const metrics = document.getElementById('edit-proj-metrics').value.split('\n').map(s => s.trim()).filter(Boolean);
      const architecture = document.getElementById('edit-proj-arch').value.split('\n').map(s => s.trim()).filter(Boolean);
      const demoUrl = document.getElementById('edit-proj-demo').value.trim();
      const githubUrl = document.getElementById('edit-proj-github').value.trim();

      const projectItem = {
        id: isEdit && dataObj.projects[index]?.id ? dataObj.projects[index].id : `project-${Date.now()}`,
        title,
        category,
        featured,
        image,
        summary,
        description: description || summary,
        techStack,
        metrics,
        architecture,
        demoUrl,
        githubUrl
      };

      if (!Array.isArray(dataObj.projects)) dataObj.projects = [];
      if (isEdit && index !== undefined) {
        dataObj.projects[index] = projectItem;
      } else {
        dataObj.projects.unshift(projectItem);
      }
    }

    if (type === 'experience') {
      const role = document.getElementById('edit-exp-role').value.trim();
      const company = document.getElementById('edit-exp-company').value.trim();
      const location = document.getElementById('edit-exp-loc').value.trim();
      const period = document.getElementById('edit-exp-period').value.trim();
      const highlights = document.getElementById('edit-exp-highlights').value.split('\n').map(s => s.trim()).filter(Boolean);
      
      const initials = company ? company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'EXP';

      const expItem = {
        role,
        company,
        location,
        period,
        logo: initials,
        highlights
      };

      if (!Array.isArray(dataObj.experience)) dataObj.experience = [];
      if (isEdit && index !== undefined) {
        dataObj.experience[index] = expItem;
      } else {
        dataObj.experience.push(expItem);
      }
    }

    if (type === 'certification') {
      const title = document.getElementById('edit-cert-title').value.trim();
      const issuer = document.getElementById('edit-cert-issuer').value.trim();
      const issueDate = document.getElementById('edit-cert-date').value.trim();
      const skills = document.getElementById('edit-cert-skills').value.split(',').map(s => s.trim()).filter(Boolean);
      const verifyUrl = document.getElementById('edit-cert-url').value.trim();

      const certItem = {
        title,
        issuer,
        issueDate,
        skills,
        verifyUrl
      };

      if (!Array.isArray(dataObj.certifications)) dataObj.certifications = [];
      if (isEdit && index !== undefined) {
        dataObj.certifications[index] = certItem;
      } else {
        dataObj.certifications.push(certItem);
      }
    }

    if (type === 'education') {
      const degree = document.getElementById('edit-edu-degree').value.trim();
      const institution = document.getElementById('edit-edu-inst').value.trim();
      const year = document.getElementById('edit-edu-year').value.trim();
      const details = document.getElementById('edit-edu-details').value.trim();

      const eduItem = { degree, institution, year, details };

      if (!Array.isArray(dataObj.education)) dataObj.education = [];
      if (isEdit && index !== undefined) {
        dataObj.education[index] = eduItem;
      } else {
        dataObj.education.push(eduItem);
      }
    }

    saveWorkingData(dataObj, `✅ ${isEdit ? 'Updated' : 'Added'} ${type} successfully!`);
    closeItemEditorModal();
  }

  function deleteItem(type, index, categoryIndex) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const dataObj = getWorkingData();

    if (type === 'skill') {
      if (categoryIndex !== undefined && index !== undefined && dataObj.skills[categoryIndex]?.items) {
        dataObj.skills[categoryIndex].items.splice(index, 1);
        if (dataObj.skills[categoryIndex].items.length === 0) {
          dataObj.skills.splice(categoryIndex, 1);
        }
      }
    } else if (type === 'project') {
      if (Array.isArray(dataObj.projects) && index !== undefined) {
        dataObj.projects.splice(index, 1);
      }
    } else if (type === 'experience') {
      if (Array.isArray(dataObj.experience) && index !== undefined) {
        dataObj.experience.splice(index, 1);
      }
    } else if (type === 'certification') {
      if (Array.isArray(dataObj.certifications) && index !== undefined) {
        dataObj.certifications.splice(index, 1);
      }
    } else if (type === 'education') {
      if (Array.isArray(dataObj.education) && index !== undefined) {
        dataObj.education.splice(index, 1);
      }
    }

    saveWorkingData(dataObj, '🗑️ Item removed successfully.');
  }

  function closeItemEditorModal() {
    const modal = document.getElementById('item-editor-modal');
    if (modal) modal.classList.remove('active');
    currentEditorContext = null;
  }

  function switchDrawerTab(targetId) {
    const drawer = document.getElementById('customizer-drawer');
    if (!drawer) return;

    const tabBtns = drawer.querySelectorAll('.drawer-tab-btn');
    const panes = drawer.querySelectorAll('.drawer-tab-pane');

    tabBtns.forEach(b => {
      if (b.getAttribute('data-tab-target') === targetId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    panes.forEach(p => {
      if (p.id === targetId) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    renderDrawerTabsContent();
  }

  function openCustomizer(tabId) {
    const drawer = document.getElementById('customizer-drawer');
    if (!drawer) return;

    populateDrawerProfileForm();
    populateDrawerResumeForm();
    renderDrawerTabsContent();
    if (tabId) {
      switchDrawerTab(tabId);
    }
    drawer.classList.add('active');
  }

  window.switchDrawerTab = switchDrawerTab;
  window.openCustomizer = openCustomizer;

  // 4. Customizer Drawer Controller
  function initCustomizerDrawer() {
    const drawer = document.getElementById('customizer-drawer');
    const toggleBtns = document.querySelectorAll('#toggle-customizer-btn, .open-customizer-btn');
    const closeBtn = document.getElementById('close-customizer-btn');

    if (!drawer) return;

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCustomizer('drawer-tab-profile');
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    }

    // Drawer Tabs switching
    const tabBtns = drawer.querySelectorAll('.drawer-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-tab-target');
        switchDrawerTab(targetId);
      });
    });

    // Profile Form Save
    const profileForm = document.getElementById('customizer-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dataObj = getWorkingData();
        dataObj.personal = dataObj.personal || {};

        dataObj.personal.name = document.getElementById('cust-name').value.trim();
        dataObj.personal.title = document.getElementById('cust-title').value.trim();
        dataObj.personal.location = document.getElementById('cust-location').value.trim();
        dataObj.personal.email = document.getElementById('cust-email').value.trim();
        dataObj.personal.phone = document.getElementById('cust-phone').value.trim();
        dataObj.personal.availability = document.getElementById('cust-availability').value.trim();
        dataObj.personal.bio = document.getElementById('cust-bio').value.trim();
        dataObj.personal.avatar = document.getElementById('cust-avatar-url').value.trim() || dataObj.personal.avatar;
        dataObj.personal.github = document.getElementById('cust-github').value.trim();
        dataObj.personal.linkedin = document.getElementById('cust-linkedin').value.trim();
        dataObj.personal.twitter = document.getElementById('cust-twitter').value.trim();

        saveWorkingData(dataObj, '👤 Profile info & photo saved permanently!');
        drawer.classList.remove('active');
      });
    }

    // Avatar File Picker
    const avatarInput = document.getElementById('cust-avatar-file');
    if (avatarInput) {
      avatarInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            const base64Img = evt.target.result;
            document.getElementById('cust-avatar-url').value = base64Img;
            document.getElementById('cust-avatar-preview').src = base64Img;
            showToast('📸 New profile photo chosen! Click "Save Profile Details" to save.');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    const avatarUrlInput = document.getElementById('cust-avatar-url');
    if (avatarUrlInput) {
      avatarUrlInput.addEventListener('input', function () {
        const preview = document.getElementById('cust-avatar-preview');
        if (preview && this.value) {
          preview.src = this.value;
        }
      });
    }

    // Intelligent PDF Parsing Helper
    async function extractTextFromPdf(arrayBuffer) {
      if (!window.pdfjsLib) {
        console.warn('PDF.js library not loaded.');
        return '';
      }
      try {
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageStr = textContent.items.map(item => item.str).join(' ');
          fullText += pageStr + '\n';
        }
        return fullText;
      } catch (err) {
        console.warn('PDF text extraction error:', err);
        return '';
      }
    }

    // Comprehensive Multi-Section Resume Parser (Skills, Projects, Experience, Certs, Education & Profile)
    function parseFullResumeDataFromText(rawText) {
      if (!rawText) return {};

      const parsed = {
        personal: {},
        skills: [],
        projects: [],
        experience: [],
        certifications: [],
        education: []
      };

      const cleanText = rawText.replace(/\r\n/g, '\n');
      const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

      // ==========================================
      // 1. Personal & Contact Information
      // ==========================================
      // Email
      const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) parsed.personal.email = emailMatch[0].trim();

      // Phone
      const phoneMatch = cleanText.match(/(?:\+91[\s-]?)?[6-9]\d{9}|\+?1?[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\(\+91\)\s*\d{10}/);
      if (phoneMatch) parsed.personal.phone = phoneMatch[0].trim();

      // GitHub
      const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)/i);
      if (githubMatch) parsed.personal.github = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;

      // LinkedIn
      const linkedinMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_.-]+)/i);
      if (linkedinMatch) parsed.personal.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;

      // Location
      const locationKeywords = ['Bengaluru', 'Bangalore', 'Karnataka', 'Hyderabad', 'Chennai', 'Mumbai', 'Delhi', 'Pune', 'Noida', 'Gurgaon', 'Kolkata', 'San Francisco', 'New York', 'California', 'India', 'Remote'];
      for (const kw of locationKeywords) {
        if (cleanText.toLowerCase().includes(kw.toLowerCase())) {
          if (cleanText.toLowerCase().includes('bengaluru') || cleanText.toLowerCase().includes('bangalore')) {
            parsed.personal.location = 'Bengaluru, Karnataka, India';
          } else if (cleanText.toLowerCase().includes('india')) {
            parsed.personal.location = `${kw}, India`;
          } else {
            parsed.personal.location = kw;
          }
          break;
        }
      }

      // Name (Top 5 header lines before email/links)
      const headerLines = lines.slice(0, 5).filter(l => !l.includes('@') && !l.includes('http') && !l.includes('.com') && !l.match(/\+?\d{10}/));
      if (headerLines.length > 0) {
        const candidate = headerLines[0].replace(/[^a-zA-Z\s.]/g, '').trim();
        if (candidate.length > 2 && candidate.split(/\s+/).length <= 4) {
          parsed.personal.name = candidate;
        }
      }

      // Title
      if (cleanText.toLowerCase().includes('mern stack developer')) {
        parsed.personal.title = 'MERN Stack Developer';
      } else if (cleanText.toLowerCase().includes('full stack developer')) {
        parsed.personal.title = 'Full Stack Developer';
      } else if (cleanText.toLowerCase().includes('frontend developer') || cleanText.toLowerCase().includes('front end developer')) {
        parsed.personal.title = 'Frontend Developer';
      } else if (cleanText.toLowerCase().includes('backend developer') || cleanText.toLowerCase().includes('back end developer')) {
        parsed.personal.title = 'Backend Developer';
      } else if (cleanText.toLowerCase().includes('software engineer')) {
        parsed.personal.title = 'Software Engineer';
      } else if (cleanText.toLowerCase().includes('software developer')) {
        parsed.personal.title = 'Software Developer';
      } else if (cleanText.toLowerCase().includes('developer')) {
        parsed.personal.title = 'Developer';
      }

      // Executive Summary / Bio
      const summaryMatch = cleanText.match(/(?:EXECUTIVE\s+SUMMARY|PROFESSIONAL\s+SUMMARY|SUMMARY|CAREER\s+OBJECTIVE|OBJECTIVE|ABOUT\s+ME)[\s\S]*?(?:TECHNICAL\s+SKILLS|SKILLS|CORE\s+COMPETENCIES|EXPERIENCE|WORK\s+EXPERIENCE|PROJECTS|EDUCATION|CERTIFICATIONS)/i);
      if (summaryMatch) {
        let summaryText = summaryMatch[0]
          .replace(/^(?:EXECUTIVE\s+SUMMARY|PROFESSIONAL\s+SUMMARY|SUMMARY|CAREER\s+OBJECTIVE|OBJECTIVE|ABOUT\s+ME)[:\s-]*/i, '')
          .replace(/(?:TECHNICAL\s+SKILLS|SKILLS|CORE\s+COMPETENCIES|EXPERIENCE|WORK\s+EXPERIENCE|PROJECTS|EDUCATION|CERTIFICATIONS)$/i, '')
          .trim();
        if (summaryText.length > 30) {
          parsed.personal.bio = summaryText;
          parsed.personal.tagline = summaryText.length > 120 ? summaryText.slice(0, 117) + '...' : summaryText;
        }
      }

      // ==========================================
      // 2. Technical Skills Extraction
      // ==========================================
      const skillsMatch = cleanText.match(/(?:TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|KEY\s+SKILLS|SKILLS|TECHNOLOGIES)[\s\S]*?(?:EXPERIENCE|WORK\s+EXPERIENCE|PROJECTS|ACADEMIC\s+PROJECTS|EDUCATION|CERTIFICATIONS|ACHIEVEMENTS|$)/i);
      if (skillsMatch) {
        const rawSkills = skillsMatch[0]
          .replace(/^(?:TECHNICAL\s+SKILLS|CORE\s+COMPETENCIES|KEY\s+SKILLS|SKILLS|TECHNOLOGIES)[:\s-]*/i, '')
          .replace(/(?:EXPERIENCE|WORK\s+EXPERIENCE|PROJECTS|ACADEMIC\s+PROJECTS|EDUCATION|CERTIFICATIONS|ACHIEVEMENTS)$/i, '')
          .trim();

        const categoryDict = {};
        const skillLines = rawSkills.split('\n').filter(l => l.trim().length > 2);

        skillLines.forEach(line => {
          if (line.includes(':')) {
            const parts = line.split(':');
            const catName = parts[0].replace(/[^a-zA-Z0-9\s&]/g, '').trim();
            const items = parts[1].split(/[,|•/]/).map(s => s.trim()).filter(s => s.length > 1);
            if (catName && items.length > 0) {
              categoryDict[catName] = (categoryDict[catName] || []).concat(items);
            }
          }
        });

        if (Object.keys(categoryDict).length > 0) {
          for (const [category, items] of Object.entries(categoryDict)) {
            const unique = [...new Set(items)];
            parsed.skills.push({
              category,
              items: unique.map(name => ({
                name,
                proficiency: 90,
                level: 'Proficient'
              }))
            });
          }
        } else {
          // Intelligent Keyword Classification Map
          const techTaxonomy = {
            'Frontend': ['React.js', 'React', 'HTML5', 'HTML', 'CSS3', 'CSS', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Responsive Web Design'],
            'Backend': ['Node.js', 'Express.js', 'RESTful APIs', 'REST APIs', 'JWT', 'Authentication', 'API Integration', 'Microservices'],
            'Databases': ['MongoDB', 'Mongoose', 'MySQL', 'PostgreSQL', 'Redis', 'Database Design'],
            'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'SQL'],
            'Developer Tools': ['Git', 'GitHub', 'Postman', 'VS Code', 'Docker', 'Vercel', 'NPM', 'Linux'],
            'Core Concepts': ['Data Structures & Algorithms', 'OOPs', 'DBMS', 'Operating Systems', 'Computer Networks', 'REST Architecture']
          };

          for (const [category, keywords] of Object.entries(techTaxonomy)) {
            const found = [];
            for (const kw of keywords) {
              const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              if (rawSkills.match(regex)) {
                found.push(kw);
              }
            }
            if (found.length > 0) {
              parsed.skills.push({
                category,
                items: found.map(name => ({
                  name,
                  proficiency: 90,
                  level: 'Proficient'
                }))
              });
            }
          }
        }
      }

      // ==========================================
      // 3. Projects Extraction
      // ==========================================
      const projectsMatch = cleanText.match(/(?:PROJECTS|ACADEMIC\s+PROJECTS|PERSONAL\s+PROJECTS|KEY\s+PROJECTS)[\s\S]*?(?:EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT|EDUCATION|CERTIFICATIONS|SKILLS|TECHNICAL\s+SKILLS|ACHIEVEMENTS|$)/i);
      if (projectsMatch) {
        const rawProjects = projectsMatch[0]
          .replace(/^(?:PROJECTS|ACADEMIC\s+PROJECTS|PERSONAL\s+PROJECTS|KEY\s+PROJECTS)[:\s-]*/i, '')
          .replace(/(?:EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT|EDUCATION|CERTIFICATIONS|SKILLS|TECHNICAL\s+SKILLS|ACHIEVEMENTS)$/i, '')
          .trim();

        const projBlocks = rawProjects.split(/\n\s*\n/).filter(b => b.trim().length > 10);
        projBlocks.forEach((block, idx) => {
          const blines = block.split('\n').map(l => l.trim()).filter(Boolean);
          if (blines.length > 0) {
            const titleLine = blines[0].replace(/^[•\-\d.]\s*/, '').trim();
            const cleanTitle = titleLine.split(/[\(|–\-:]/)[0].trim();

            let techStack = [];
            const techMatch = block.match(/(?:Tech\s*Stack|Technologies|Tools\s*Used)[:\s-]*([^\n]+)/i) || titleLine.match(/\(([^)]+)\)/);
            if (techMatch) {
              techStack = techMatch[1].split(/[,|/]/).map(t => t.trim()).filter(Boolean);
            } else {
              ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'REST API', 'Firebase'].forEach(t => {
                if (block.toLowerCase().includes(t.toLowerCase())) techStack.push(t);
              });
            }

            const bullets = blines.slice(1).filter(l => l.startsWith('•') || l.startsWith('-') || l.length > 20).map(l => l.replace(/^[•\-*]\s*/, '').trim());
            const desc = bullets.length > 0 ? bullets.join(' ') : blines.slice(1).join(' ') || titleLine;

            if (cleanTitle && cleanTitle.length > 2) {
              parsed.projects.push({
                id: `project-${Date.now()}-${idx}`,
                title: cleanTitle,
                category: techStack.includes('React.js') || techStack.includes('Node.js') ? 'Full Stack' : 'Web App',
                featured: idx < 2,
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                summary: desc.length > 180 ? desc.slice(0, 177) + '...' : desc,
                description: desc,
                techStack: techStack.length > 0 ? techStack : ['MERN', 'MongoDB', 'Express.js', 'React.js', 'Node.js'],
                metrics: [
                  "Implemented full stack component workflows and state management",
                  "Built secure RESTful APIs with database integration",
                  "Ensured responsive design and fast query response"
                ],
                architecture: bullets.length > 0 ? bullets : [desc],
                demoUrl: "#",
                githubUrl: parsed.personal.github || "https://github.com/Rakeshbjp"
              });
            }
          }
        });
      }

      // ==========================================
      // 4. Experience / Work History Extraction
      // ==========================================
      const expMatch = cleanText.match(/(?:WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|INTERNSHIPS)[\s\S]*?(?:PROJECTS|EDUCATION|CERTIFICATIONS|SKILLS|TECHNICAL\s+SKILLS|ACHIEVEMENTS|$)/i);
      if (expMatch) {
        const rawExp = expMatch[0]
          .replace(/^(?:WORK\s+EXPERIENCE|EXPERIENCE|EMPLOYMENT\s+HISTORY|INTERNSHIPS)[:\s-]*/i, '')
          .replace(/(?:PROJECTS|EDUCATION|CERTIFICATIONS|SKILLS|TECHNICAL\s+SKILLS|ACHIEVEMENTS)$/i, '')
          .trim();

        const expBlocks = rawExp.split(/\n\s*\n/).filter(b => b.trim().length > 10);
        expBlocks.forEach((block, idx) => {
          const elines = block.split('\n').map(l => l.trim()).filter(Boolean);
          if (elines.length > 0) {
            const firstLine = elines[0].replace(/^[•\-\d.]\s*/, '').trim();
            const parts = firstLine.split(/[|–\-,]/);
            const role = parts[0] ? parts[0].trim() : 'Software Developer';
            const company = parts[1] ? parts[1].trim() : (elines[1] || 'Tech Organization');

            const dateMatch = block.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})\s*[\w\s–-]+(?:Present|[0-9]{4})/i);
            const period = dateMatch ? dateMatch[0].trim() : '2023 - Present';

            const bullets = elines.slice(1).filter(l => l.startsWith('•') || l.startsWith('-') || l.length > 20).map(l => l.replace(/^[•\-*]\s*/, '').trim());

            parsed.experience.push({
              role,
              company,
              location: parsed.personal.location || 'Bengaluru, India',
              period,
              logo: company.slice(0, 3).toUpperCase(),
              highlights: bullets.length > 0 ? bullets : [elines.slice(1).join(' ') || 'Developed web applications and handled full stack integration.']
            });
          }
        });
      }

      // ==========================================
      // 5. Education Extraction
      // ==========================================
      const eduMatch = cleanText.match(/(?:EDUCATION|ACADEMIC\s+BACKGROUND|QUALIFICATIONS)[\s\S]*?(?:EXPERIENCE|PROJECTS|CERTIFICATIONS|SKILLS|ACHIEVEMENTS|$)/i);
      if (eduMatch) {
        const rawEdu = eduMatch[0]
          .replace(/^(?:EDUCATION|ACADEMIC\s+BACKGROUND|QUALIFICATIONS)[:\s-]*/i, '')
          .replace(/(?:EXPERIENCE|PROJECTS|CERTIFICATIONS|SKILLS|ACHIEVEMENTS)$/i, '')
          .trim();

        const eduLines = rawEdu.split('\n').map(l => l.trim()).filter(Boolean);
        if (eduLines.length > 0) {
          let degree = 'Bachelor of Engineering in Computer Science & Engineering';
          let institution = 'Visvesvaraya Technological University';
          let year = '2020 - 2024';
          let details = 'Computer Science & Engineering';

          for (const eline of eduLines) {
            if (eline.match(/(?:Bachelor|B\.E|B\.Tech|Degree|Master|Diploma|BCA|MCA|B\.Sc)/i)) {
              degree = eline;
            } else if (eline.match(/(?:University|Institute|College|School|Academy)/i)) {
              institution = eline;
            } else if (eline.match(/(?:20\d\d|19\d\d)/)) {
              year = eline;
            } else if (eline.match(/(?:CGPA|Percentage|Score|Grade|Distinction)/i)) {
              details = eline;
            }
          }

          parsed.education.push({
            degree,
            institution,
            year,
            details
          });
        }
      }

      // ==========================================
      // 6. Certifications Extraction
      // ==========================================
      const certMatch = cleanText.match(/(?:CERTIFICATIONS|CERTIFICATES|ACCREDITATIONS|LICENSES\s+&\s+CERTIFICATIONS)[\s\S]*?(?:EDUCATION|EXPERIENCE|PROJECTS|SKILLS|ACHIEVEMENTS|$)/i);
      if (certMatch) {
        const rawCert = certMatch[0]
          .replace(/^(?:CERTIFICATIONS|CERTIFICATES|ACCREDITATIONS|LICENSES\s+&\s+CERTIFICATIONS)[:\s-]*/i, '')
          .replace(/(?:EDUCATION|EXPERIENCE|PROJECTS|SKILLS|ACHIEVEMENTS)$/i, '')
          .trim();

        const certLines = rawCert.split('\n').map(l => l.replace(/^[•\-*]\s*/, '').trim()).filter(l => l.length > 5);
        certLines.forEach((cline, idx) => {
          const parts = cline.split(/[|–\-,]/);
          const title = parts[0] ? parts[0].trim() : cline;
          const issuer = parts[1] ? parts[1].trim() : 'Certified';
          parsed.certifications.push({
            title,
            issuer,
            issueDate: 'Verified',
            skills: ['Full Stack', 'MERN Stack'],
            verifyUrl: '#'
          });
        });
      }

      return parsed;
    }

    // Unified Resume Upload & Full Auto-Fetch Handler
    async function processResumePdfFile(file) {
      if (!file) return;

      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('⚠️ Please choose a valid .PDF document file.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        showToast('⚠️ PDF file is larger than 8MB. Please compress or link via URL.');
        return;
      }

      showToast('⏳ Reading & parsing entire resume PDF...');

      let extractedText = '';
      try {
        const arrayBuffer = await file.arrayBuffer();
        extractedText = await extractTextFromPdf(arrayBuffer);
      } catch (err) {
        console.warn('Could not extract PDF text:', err);
      }

      const parsedFull = parseFullResumeDataFromText(extractedText);

      const reader = new FileReader();
      reader.onload = function (evt) {
        const base64Pdf = evt.target.result;
        const dataObj = getWorkingData();
        dataObj.personal = dataObj.personal || {};

        dataObj.personal.resumePdf = base64Pdf;
        dataObj.personal.resumeFileName = file.name;

        // Merge extracted Personal Profile
        if (parsedFull.personal.name && parsedFull.personal.name !== 'Your Name') dataObj.personal.name = parsedFull.personal.name;
        if (parsedFull.personal.title) dataObj.personal.title = parsedFull.personal.title;
        if (parsedFull.personal.email) dataObj.personal.email = parsedFull.personal.email;
        if (parsedFull.personal.phone) dataObj.personal.phone = parsedFull.personal.phone;
        if (parsedFull.personal.location) dataObj.personal.location = parsedFull.personal.location;
        if (parsedFull.personal.github) dataObj.personal.github = parsedFull.personal.github;
        if (parsedFull.personal.linkedin) dataObj.personal.linkedin = parsedFull.personal.linkedin;
        if (parsedFull.personal.bio) dataObj.personal.bio = parsedFull.personal.bio;
        if (parsedFull.personal.tagline) dataObj.personal.tagline = parsedFull.personal.tagline;

        // Auto-populate Skills if extracted
        if (parsedFull.skills && parsedFull.skills.length > 0) {
          dataObj.skills = parsedFull.skills;
        }

        // Auto-populate Projects if extracted
        if (parsedFull.projects && parsedFull.projects.length > 0) {
          dataObj.projects = parsedFull.projects;
        }

        // Auto-populate Experience if extracted
        if (parsedFull.experience && parsedFull.experience.length > 0) {
          dataObj.experience = parsedFull.experience;
        }

        // Auto-populate Education if extracted
        if (parsedFull.education && parsedFull.education.length > 0) {
          dataObj.education = parsedFull.education;
        }

        // Auto-populate Certifications if extracted
        if (parsedFull.certifications && parsedFull.certifications.length > 0) {
          dataObj.certifications = parsedFull.certifications;
        }

        saveWorkingData(dataObj, `🎉 Resume "${file.name}" uploaded! All Skills, Projects, Experience, Certifications & Profile auto-fetched!`);
        populateDrawerProfileForm();
        populateDrawerResumeForm();
      };
      reader.readAsDataURL(file);
    }

    window.processResumePdfFile = processResumePdfFile;

    // Resume PDF File Picker Listener
    const resumeFileInput = document.getElementById('cust-resume-file');
    if (resumeFileInput) {
      resumeFileInput.addEventListener('change', function (e) {
        processResumePdfFile(e.target.files[0]);
      });
    }

    // Resume PDF Form Submit
    const resumeForm = document.getElementById('customizer-resume-form');
    if (resumeForm) {
      resumeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dataObj = getWorkingData();
        dataObj.personal = dataObj.personal || {};
        dataObj.personal.resumeUrl = document.getElementById('cust-resume-url').value.trim();
        const summaryInput = document.getElementById('cust-resume-summary');
        if (summaryInput && summaryInput.value.trim()) {
          dataObj.personal.bio = summaryInput.value.trim();
        }
        saveWorkingData(dataObj, '📄 Resume settings & summary saved!');
        drawer.classList.remove('active');
      });
    }

    // Remove PDF Button
    const removePdfBtn = document.getElementById('cust-remove-pdf-btn');
    if (removePdfBtn) {
      removePdfBtn.addEventListener('click', () => {
        const dataObj = getWorkingData();
        if (dataObj.personal?.resumePdf) {
          delete dataObj.personal.resumePdf;
          delete dataObj.personal.resumeFileName;
          saveWorkingData(dataObj, '🗑️ Uploaded PDF removed.');
          populateDrawerResumeForm();
        }
      });
    }

    // Global Item Editor Form
    const itemForm = document.getElementById('item-editor-form');
    if (itemForm) {
      itemForm.addEventListener('submit', handleEditorFormSubmit);
    }

    const itemModalCloseBtns = document.querySelectorAll('#item-editor-modal .modal-close-btn, #cancel-item-editor-btn');
    itemModalCloseBtns.forEach(btn => {
      btn.addEventListener('click', closeItemEditorModal);
    });

    // Clear Demo Data Button
    const clearBtn = document.getElementById('cust-clear-demo-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => clearAllDemoData(false));
    }

    // Restore Demo Data Button
    const resetBtn = document.getElementById('cust-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => restoreDemoData(false));
    }

    // Export Data File
    const exportBtn = document.getElementById('cust-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportDataFile);
    }

    // Import JSON File
    const importInput = document.getElementById('cust-import-file');
    if (importInput) {
      importInput.addEventListener('change', importDataFile);
    }
  }

  function populateDrawerProfileForm() {
    const dataObj = getWorkingData();
    const p = dataObj.personal || {};

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('cust-name', p.name);
    setVal('cust-title', p.title);
    setVal('cust-location', p.location);
    setVal('cust-email', p.email);
    setVal('cust-phone', p.phone);
    setVal('cust-availability', p.availability);
    setVal('cust-bio', p.bio);
    setVal('cust-avatar-url', p.avatar);
    setVal('cust-github', p.github);
    setVal('cust-linkedin', p.linkedin);
    setVal('cust-twitter', p.twitter);

    const preview = document.getElementById('cust-avatar-preview');
    if (preview) {
      preview.src = p.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23334155"/></svg>';
    }
  }

  function populateDrawerResumeForm() {
    const dataObj = getWorkingData();
    const p = dataObj.personal || {};

    const urlEl = document.getElementById('cust-resume-url');
    if (urlEl) urlEl.value = p.resumeUrl && p.resumeUrl !== '#' ? p.resumeUrl : '';

    const summaryEl = document.getElementById('cust-resume-summary');
    if (summaryEl) summaryEl.value = p.bio || '';

    const statusEl = document.getElementById('cust-uploaded-pdf-info');
    const removeBtn = document.getElementById('cust-remove-pdf-btn');
    if (statusEl) {
      if (p.resumePdf) {
        statusEl.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; color: #10b981; font-size: 0.85rem;">✅ PDF File Uploaded:</div>
              <div style="font-size: 0.8rem; color: var(--text-main); font-weight: 600;">${escapeHtml(p.resumeFileName || 'Resume.pdf')}</div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.viewResumePdf()">👁️ Preview</button>
          </div>
        `;
        if (removeBtn) removeBtn.style.display = 'inline-block';
      } else {
        statusEl.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.4rem;">No custom PDF uploaded yet. (Generated HTML sheet is active).</div>`;
        if (removeBtn) removeBtn.style.display = 'none';
      }
    }
  }

  function renderDrawerTabsContent() {
    const dataObj = getWorkingData();

    // 1. Skills Tab List
    const skillsListEl = document.getElementById('drawer-skills-list');
    if (skillsListEl) {
      if (!dataObj.skills || dataObj.skills.length === 0) {
        skillsListEl.innerHTML = `<div class="drawer-empty-msg">No skills added yet. Click "+ Add Skill" below to add your competencies.</div>`;
      } else {
        let html = '';
        dataObj.skills.forEach((cat, cIdx) => {
          html += `<div class="drawer-category-heading">📂 ${escapeHtml(cat.category)}</div>`;
          (cat.items || []).forEach((item, iIdx) => {
            html += `
              <div class="drawer-item-row">
                <div>
                  <strong>${escapeHtml(item.name)}</strong>
                  <span style="font-size: 0.75rem; color: var(--text-dim); margin-left: 0.5rem;">${item.proficiency}% (${item.level || 'Proficient'})</span>
                </div>
                <div class="drawer-item-actions">
                  <button type="button" class="btn-icon-action" title="Edit" onclick="window.openItemEditor({ type: 'skill', mode: 'edit', categoryIndex: ${cIdx}, index: ${iIdx}, item: window.getSkillItem(${cIdx}, ${iIdx}) })">✏️</button>
                  <button type="button" class="btn-icon-action delete" title="Delete" onclick="window.deleteItem('skill', ${iIdx}, ${cIdx})">🗑️</button>
                </div>
              </div>
            `;
          });
        });
        skillsListEl.innerHTML = html;
      }
    }

    // 2. Projects Tab List
    const projectsListEl = document.getElementById('drawer-projects-list');
    if (projectsListEl) {
      if (!dataObj.projects || dataObj.projects.length === 0) {
        projectsListEl.innerHTML = `<div class="drawer-empty-msg">No projects added yet. Click "+ Add Project" below to showcase your work.</div>`;
      } else {
        projectsListEl.innerHTML = dataObj.projects.map((proj, pIdx) => `
          <div class="drawer-item-row">
            <div style="display: flex; gap: 0.5rem; align-items: center; overflow: hidden;">
              <img src="${escapeHtml(proj.image || '')}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=100&q=80'" />
              <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <strong>${escapeHtml(proj.title)}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(proj.category || 'General')} ${proj.featured ? '⭐ Featured' : ''}</div>
              </div>
            </div>
            <div class="drawer-item-actions">
              <button type="button" class="btn-icon-action" title="Edit" onclick="window.openItemEditor({ type: 'project', mode: 'edit', index: ${pIdx}, item: window.getProjectItem(${pIdx}) })">✏️</button>
              <button type="button" class="btn-icon-action delete" title="Delete" onclick="window.deleteItem('project', ${pIdx})">🗑️</button>
            </div>
          </div>
        `).join('');
      }
    }

    // 3. Experience Tab List
    const expListEl = document.getElementById('drawer-experience-list');
    if (expListEl) {
      if (!dataObj.experience || dataObj.experience.length === 0) {
        expListEl.innerHTML = `<div class="drawer-empty-msg">No work experience added yet. Click "+ Add Experience" below to build your timeline.</div>`;
      } else {
        expListEl.innerHTML = dataObj.experience.map((exp, eIdx) => `
          <div class="drawer-item-row">
            <div>
              <strong>${escapeHtml(exp.role)}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(exp.company)} (${escapeHtml(exp.period)})</div>
            </div>
            <div class="drawer-item-actions">
              <button type="button" class="btn-icon-action" title="Edit" onclick="window.openItemEditor({ type: 'experience', mode: 'edit', index: ${eIdx}, item: window.getExperienceItem(${eIdx}) })">✏️</button>
              <button type="button" class="btn-icon-action delete" title="Delete" onclick="window.deleteItem('experience', ${eIdx})">🗑️</button>
            </div>
          </div>
        `).join('');
      }
    }

    // 4. Certifications Tab List
    const certListEl = document.getElementById('drawer-certifications-list');
    if (certListEl) {
      if (!dataObj.certifications || dataObj.certifications.length === 0) {
        certListEl.innerHTML = `<div class="drawer-empty-msg">No certifications added yet. Click "+ Add Certification" below.</div>`;
      } else {
        certListEl.innerHTML = dataObj.certifications.map((cert, cIdx) => `
          <div class="drawer-item-row">
            <div>
              <strong>${escapeHtml(cert.title)}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(cert.issuer)} (${escapeHtml(cert.issueDate || '')})</div>
            </div>
            <div class="drawer-item-actions">
              <button type="button" class="btn-icon-action" title="Edit" onclick="window.openItemEditor({ type: 'certification', mode: 'edit', index: ${cIdx}, item: window.getCertificationItem(${cIdx}) })">✏️</button>
              <button type="button" class="btn-icon-action delete" title="Delete" onclick="window.deleteItem('certification', ${cIdx})">🗑️</button>
            </div>
          </div>
        `).join('');
      }
    }

    // 5. Education List in Resume Tab
    const eduListEl = document.getElementById('drawer-education-list');
    if (eduListEl) {
      const eduData = dataObj.education || [];
      if (eduData.length === 0) {
        eduListEl.innerHTML = `<div class="drawer-empty-msg">No education entries added yet. Click "+ Add Education" below.</div>`;
      } else {
        eduListEl.innerHTML = eduData.map((ed, edIdx) => `
          <div class="drawer-item-row">
            <div>
              <strong>${escapeHtml(ed.degree)}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(ed.institution)} (${escapeHtml(ed.year || '')})</div>
            </div>
            <div class="drawer-item-actions">
              <button type="button" class="btn-icon-action" title="Edit" onclick="window.openItemEditor({ type: 'education', mode: 'edit', index: ${edIdx}, item: window.getEducationItem(${edIdx}) })">✏️</button>
              <button type="button" class="btn-icon-action delete" title="Delete" onclick="window.deleteItem('education', ${edIdx})">🗑️</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // 6. Resume PDF View, Download, and Print Helpers
  function viewResumePdf() {
    const dataObj = getWorkingData();
    const pdf = dataObj.personal?.resumePdf;
    const url = dataObj.personal?.resumeUrl;

    if (pdf) {
      try {
        const blob = dataURItoBlob(pdf);
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (e) {
        // Fallback directly
        const win = window.open();
        win.document.write(`<iframe src="${pdf}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    } else if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      showToast('📄 Opening printable resume preview. You can also upload your custom PDF!');
      window.print();
    }
  }

  function downloadResumePdf() {
    const dataObj = getWorkingData();
    const pdf = dataObj.personal?.resumePdf;
    const filename = dataObj.personal?.resumeFileName || `${(dataObj.personal?.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`;

    if (pdf) {
      const a = document.createElement('a');
      a.href = pdf;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`📥 Downloading ${filename}`);
    } else if (dataObj.personal?.resumeUrl && dataObj.personal.resumeUrl !== '#') {
      window.open(dataObj.personal.resumeUrl, '_blank');
    } else {
      showToast('📄 Triggering print / save as PDF for your resume sheet.');
      window.print();
    }
  }

  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  function exportDataFile() {
    const dataObj = getWorkingData();
    const jsonStr = JSON.stringify(dataObj, null, 2);
    const content = `/**\n * PORTFOLIO DATA CONFIGURATION\n * Generated via Live Portfolio Customizer\n */\n\nconst portfolioData = ${jsonStr};\n\nwindow.portfolioData = portfolioData;\nwindow.defaultPortfolioData = JSON.parse(JSON.stringify(portfolioData));\n`;
    
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.js';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Downloaded data.js file backup!');
  }

  function importDataFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        let text = evt.target.result;
        if (text.includes('portfolioData =')) {
          const match = text.match(/portfolioData\s*=\s*(\{[\s\S]*\});/);
          if (match && match[1]) {
            text = match[1];
          }
        }
        const parsed = JSON.parse(text);
        saveWorkingData(parsed, '📤 Portfolio data imported successfully!');
        populateDrawerProfileForm();
        populateDrawerResumeForm();
      } catch (err) {
        alert('Invalid data file format. Please ensure you upload a valid data.js or JSON file.');
      }
    };
    reader.readAsText(file);
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

  // Global Accessors for Inline Handlers
  window.getWorkingData = getWorkingData;
  window.saveWorkingData = saveWorkingData;
  window.clearAllDemoData = clearAllDemoData;
  window.restoreDemoData = restoreDemoData;
  window.openItemEditor = openItemEditor;
  window.deleteItem = deleteItem;
  window.closeItemEditorModal = closeItemEditorModal;
  window.exportDataFile = exportDataFile;
  window.viewResumePdf = viewResumePdf;
  window.downloadResumePdf = downloadResumePdf;

  window.getSkillItem = function (cIdx, iIdx) {
    return getWorkingData().skills?.[cIdx]?.items?.[iIdx];
  };

  window.getProjectItem = function (pIdx) {
    return getWorkingData().projects?.[pIdx];
  };

  window.getExperienceItem = function (eIdx) {
    return getWorkingData().experience?.[eIdx];
  };

  window.getCertificationItem = function (cIdx) {
    return getWorkingData().certifications?.[cIdx];
  };

  window.getEducationItem = function (edIdx) {
    return getWorkingData().education?.[edIdx];
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomizerDrawer);
  } else {
    initCustomizerDrawer();
  }
})();
