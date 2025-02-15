# GitHub Pages Frontend Plan for Deep Research

## 1. Site Architecture

### Pages
1. **Home Page** (`index.html`)
   - Hero section with embedded terminal demo
   - "Try it Now" as main call-to-action
   - Pre-recorded demo video showing key features
   - Quick feature highlights
   - Project creator introduction
   - GitHub button and star count

2. **Demo Page** (`demo.html`)
   - Interactive terminal interface
   - Limited functionality demo (no API keys required)
   - Pre-recorded example searches
   - Sample research paths
   - Live output examples
   - One-click copy of commands
   - "Get Started" call-to-action for full access

3. **Quick Start** (`quickstart.html`)
   - Minimal setup instructions
   - API key acquisition steps
   - Basic usage examples
   - Common configurations
   - Troubleshooting tips

4. **About Page** (`about.html`)
   - Project vision and philosophy
   - Creator profile and expertise
   - Professional background
   - Open source contributions
   - Contact information
   - Link to full resume

3. **Demo Page** (`demo.html`)
   - Interactive demo showcase
   - Example research paths
   - Sample outputs
   - Performance metrics

4. **Privacy Page** (`privacy.html`)
   - Privacy features explanation
   - Data handling policies
   - Security measures
   - Comparison with other tools

### Components
1. **Navigation**
   - Responsive header
   - Mobile hamburger menu
   - Quick links to key sections

2. **Footer**
   - Social links
   - GitHub repository link
   - Contact information
   - License information

## 2. Design System

### Colors
- Primary: #007AFF (Venice.ai blue)
- Secondary: #FB542B (Brave orange)
- Background: 
  - Light: #FFFFFF
  - Dark: #1A1A1A
- Text:
  - Light: #333333
  - Dark: #F5F5F5
- Accents:
  - Success: #28A745
  - Warning: #FFC107
  - Error: #DC3545

### Typography
- Headings: Inter (sans-serif)
- Body: System UI stack
- Code: JetBrains Mono

### Components Design
1. **Buttons**
   - Primary (filled)
   - Secondary (outlined)
   - Ghost (text-only)
   - Icon buttons

2. **Cards**
   - Feature cards
   - Comparison cards
   - Code example cards

3. **Tables**
   - Comparison tables
   - Feature matrices
   - Model specifications

4. **Code Blocks**
   - Syntax highlighting
   - Copy button
   - Language indicator

## 3. Technical Implementation

### Project Structure
```
deep-research/
├── src/                    # Existing TypeScript source
├── docs/                   # GitHub Pages content
│   ├── index.html         # Home page
│   ├── about.html         # About page
│   ├── docs.html          # Documentation
│   ├── demo.html          # Interactive demo
│   ├── privacy.html       # Privacy policy
│   ├── assets/
│   │   ├── css/          # Stylesheets
│   │   ├── js/           # JavaScript modules
│   │   └── img/          # Images and icons
│   └── _layouts/          # Jekyll templates
└── package.json           # Project configuration
```

### Core Technologies
- Static Site Generator: Jekyll (GitHub Pages native support)
- CSS: Custom Properties + PostCSS for optimization
- JavaScript: ES6 modules (no framework dependencies)
- Build Tools:
  - Jekyll for static site generation
  - PostCSS for CSS processing
  - Terser for JS minification

### UI Components Implementation

1. **Terminal Component** (`_includes/terminal.html`)
```html
<div class="terminal">
  <div class="terminal__header">
    <span class="terminal__title">Deep Research Demo</span>
    <div class="terminal__controls">
      <button class="terminal__minimize"></button>
      <button class="terminal__maximize"></button>
      <button class="terminal__close"></button>
    </div>
  </div>
  <div class="terminal__body">
    <div class="terminal__output"></div>
    <div class="terminal__input-line">
      <span class="terminal__prompt">$</span>
      <input type="text" class="terminal__input" aria-label="Terminal input">
    </div>
  </div>
</div>
```

2. **Demo Player Component** (`_includes/demo-player.html`)
```html
<div class="demo-player">
  <div class="demo-player__video">
    <video controls poster="/assets/img/demo-thumbnail.png">
      <source src="/assets/video/demo.webm" type="video/webm">
      <source src="/assets/video/demo.mp4" type="video/mp4">
    </video>
  </div>
  <div class="demo-player__examples">
    <button class="demo-player__example" data-command="research 'privacy in AI'">
      Research AI Privacy
    </button>
    <button class="demo-player__example" data-command="compare 'Venice vs OpenAI'">
      Compare AI Models
    </button>
  </div>
</div>
```

3. **Navigation Component** (`_includes/nav.html`)
```html
<nav class="nav">
  <div class="nav__logo">
    <img src="/assets/img/logo.svg" alt="Deep Research">
  </div>
  <div class="nav__links">
    <a href="/">Home</a>
    <a href="/demo">Try It</a>
    <a href="/quickstart">Quick Start</a>
    <a href="/about">About</a>
  </div>
  <button class="nav__theme-toggle" aria-label="Toggle dark mode">
    <svg><!-- Moon/Sun icon --></svg>
  </button>
</nav>
```

### JavaScript Modules

1. **Terminal Manager** (`assets/js/terminal.js`)
```javascript
export class TerminalManager {
  constructor(element, options = {}) {
    this.terminal = element;
    this.output = element.querySelector('.terminal__output');
    this.input = element.querySelector('.terminal__input');
    this.isDemo = options.demo || false;
    this.history = [];
    this.historyIndex = -1;
    
    // Demo mode responses (no API keys needed)
    this.demoResponses = {
      'research "privacy in AI"': [
        'Searching for information about privacy in AI...',
        '1. Privacy concerns in AI development',
        '2. Data protection methods',
        '3. Ethical considerations',
        'Would you like to explore any of these topics?'
      ],
      'compare "Venice vs OpenAI"': [
        'Comparing Venice.ai and OpenAI...',
        '• Venice.ai: Uncensored models, privacy focus',
        '• OpenAI: Mainstream provider, content restrictions',
        'Key differences in approach and philosophy...'
      ]
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.addEventListener('keydown', (e) => this.handleInput(e));
    document.querySelectorAll('.demo-player__example').forEach(btn => {
      btn.addEventListener('click', () => {
        const command = btn.dataset.command;
        this.runCommand(command);
      });
    });
  }

  async runCommand(command) {
    this.addToOutput(`$ ${command}`);
    
    if (this.isDemo) {
      // Demo mode: Use pre-defined responses
      const response = this.demoResponses[command] || ['Try one of our example commands!'];
      for (const line of response) {
        await this.typeOutput(line);
      }
    } else {
      // Full mode: Connect to actual backend
      try {
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command })
        });
        const data = await response.json();
        await this.typeOutput(data.result);
      } catch (error) {
        this.addToOutput('Error: Please check your API configuration');
      }
    }
  }

  async typeOutput(text, speed = 30) {
    const chars = text.split('');
    for (const char of chars) {
      await new Promise(resolve => setTimeout(resolve, speed));
      this.addToOutput(char, true);
    }
    this.addToOutput(''); // New line
  }

  addToOutput(text, sameLine = false) {
    if (sameLine) {
      const lines = this.output.querySelectorAll('div');
      const lastLine = lines[lines.length - 1];
      lastLine.textContent += text;
    } else {
      const line = document.createElement('div');
      line.textContent = text;
      this.output.appendChild(line);
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  handleInput(e) {
    if (e.key === 'Enter') {
      const command = this.input.value.trim();
      if (command) {
        this.history.push(command);
        this.historyIndex = this.history.length;
        this.runCommand(command);
        this.input.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
    }
  }
}
```

2. **Demo Player** (`assets/js/demo-player.js`)
```javascript
export class DemoPlayer {
  constructor() {
    this.video = document.querySelector('.demo-player__video video');
    this.examples = document.querySelectorAll('.demo-player__example');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.examples.forEach(example => {
      example.addEventListener('click', () => {
        // Pause current video if playing
        this.video.pause();
        // Load corresponding demo video section
        const timestamp = example.dataset.timestamp;
        if (timestamp) {
          this.video.currentTime = parseFloat(timestamp);
          this.video.play();
        }
      });
    });
  }
}
```

3. **Theme Manager** (`assets/js/theme.js`)
```javascript
export class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'dark'; // Default to dark theme for terminal
    this.init();
  }

  init() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.setupToggle();
  }

  setupToggle() {
    const toggle = document.querySelector('.nav__theme-toggle');
    toggle?.addEventListener('click', () => this.toggleTheme());
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
  }
}
```

### CSS Architecture

1. **CSS Custom Properties** (`assets/css/variables.css`)
```css
:root {
  /* Colors */
  --color-primary: #007AFF;
  --color-secondary: #FB542B;
  --color-background: #FFFFFF;
  --color-text: #333333;
  
  /* Typography */
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: system-ui, sans-serif;
  --font-code: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
}

[data-theme="dark"] {
  --color-background: #1A1A1A;
  --color-text: #F5F5F5;
}
```

2. **Component Styles** (`assets/css/components/`)
```css
/* nav.css */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-background);
}

/* feature-card.css */
.feature-card {
  padding: var(--space-lg);
  border-radius: 8px;
  background: var(--color-background);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* code-block.css */
.code-block {
  margin: var(--space-md) 0;
  border-radius: 4px;
  overflow: hidden;
}
```

### Performance Optimizations

1. **Critical CSS Inlining**
- Use Jekyll plugin `jekyll-minifier`
- Inline critical styles in `<head>`
- Defer non-critical CSS

2. **Image Optimization**
- Use WebP format with fallbacks
- Implement lazy loading
- Provide responsive images using `srcset`

3. **JavaScript Loading**
```html
<!-- Defer non-critical JavaScript -->
<script type="module" src="/assets/js/main.js" defer></script>
```

### Integration with Existing Project

1. **Documentation Generation**
- Parse TypeScript source using TypeDoc
- Generate API documentation
- Integrate with Jekyll build process

2. **Demo Integration**
- Create isolated demo environment
- Load necessary modules from main project
- Implement sandbox security measures

3. **Build Process**
```json
{
  "scripts": {
    "build:docs": "jekyll build",
    "build:css": "postcss src/css/main.css -o docs/assets/css/main.css",
    "build:js": "rollup -c",
    "build": "npm run build:css && npm run build:js && npm run build:docs"
  }
}
```

## 4. Content Strategy

### Home Page Content
1. **Hero Section**
   - "Privacy-First Research Tool"
   - "Powered by Venice.ai and Brave Search"
   - GitHub stars counter
   - Quick start button

2. **Features Grid**
   - Privacy Focus
   - Search Capabilities
   - AI Integration
   - Local Processing

3. **Comparison Table**
   - Feature comparison with alternatives
   - Privacy advantages
   - Technical benefits

### Documentation Content
1. **Getting Started**
   - Step-by-step installation
   - API key acquisition
   - Configuration guide
   - Basic usage examples

2. **Advanced Usage**
   - Custom configurations
   - Model selection
   - Search optimization
   - Error handling

## 5. Implementation Phases

### Phase 1: Foundation
1. Set up GitHub Pages
2. Create basic HTML structure
3. Implement core CSS
4. Add responsive navigation

### Phase 2: Content
1. Write and format all page content
2. Create documentation
3. Add code examples
4. Implement syntax highlighting

### Phase 3: Interactivity
1. Add dark mode toggle
2. Implement mobile menu
3. Add copy-to-clipboard functionality
4. Create demo animations

### Phase 4: Polish
1. Add transitions and animations
2. Optimize images and assets
3. Implement performance optimizations
4. Add privacy-focused analytics

### Phase 5: Launch
1. Final testing across devices
2. Documentation review
3. Performance audit
4. Launch and announce

## 6. Success Metrics

### Performance
- Lighthouse score > 90
- Page load time < 2s
- First contentful paint < 1s

### Accessibility
- WCAG 2.1 AA compliance
- Perfect Lighthouse accessibility score
- Keyboard navigation support

### SEO
- Perfect Lighthouse SEO score
- Structured data implementation
- Optimized meta tags

## Next Steps

1. Create GitHub Pages branch
2. Set up basic directory structure
3. Implement core HTML/CSS
4. Begin with home page development

Would you like to proceed with this plan and move to implementation?