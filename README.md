# S Rakesh Kumar - Developer Portfolio 🚀

A modern, high-performance, and responsive personal developer portfolio featuring an interactive content customizer, ambient particle canvas background, project showcase, resume PDF manager, and dual-layer data persistence.

![Portfolio Preview](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- ⚡ **Modern Aesthetic UI**: Sleek dark mode design with glassmorphic cards, smooth typography, and responsive grid layouts.
- 🌌 **Ambient Interactive Canvas**: Dynamic node-connecting particle animation that reacts to cursor interaction.
- ⚙️ **Live Content Editor Drawer**: In-browser customizer (accessed via the ⚙️ icon or "Edit Profile" button) allowing real-time edits to:
  - Personal Information & Avatar
  - Skills Matrix & Proficiencies
  - Projects Showcase with Modals
  - Work Experience & Career Highlights
  - Certifications & Credentials
  - Education History
- 📄 **Resume PDF Management**:
  - Upload custom PDF resumes directly in-browser.
  - One-click viewing and downloading.
  - Dedicated clean 1-page print layout (`@media print`).
- 💾 **Dual-Layer Persistence**:
  - Auto-syncs to browser `localStorage` across multiple keys.
  - Auto-saves directly to `js/data.js` on disk via the local Python HTTP server (`server.py`).

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), JavaScript (ES6+)
- **Canvas Effects**: HTML5 2D Context Animation
- **Backend / Local Server**: Python `http.server` with `/api/save-data` persistence endpoint

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Rakeshbjp/My-Portfolio.git
cd My-Portfolio
```

### 2. Run the local development server
```bash
python server.py
```

### 3. Open in your browser
Navigate to **[http://127.0.0.1:8080](http://127.0.0.1:8080)** in any modern web browser.

---

## 📁 Project Structure

```
.
├── index.html        # Main HTML structure
├── server.py         # Python HTTP server with auto-save endpoint
├── .gitignore        # Git ignore rules
├── README.md         # Project documentation
├── css/
│   └── styles.css    # Responsive styles and design tokens
└── js/
    ├── app.js        # Main portfolio rendering logic
    ├── canvas-bg.js  # Interactive ambient particle background
    ├── customizer.js # Live drawer content manager & editor
    └── data.js       # Core portfolio configuration & persistent data
```

---

## 👤 Author

**S Rakesh Kumar**  
- GitHub: [@inkworldwide](https://github.com/inkworldwide) / [@Rakeshbjp](https://github.com/Rakeshbjp)
- Email: srakeshkumarrk2468@gmail.com
