export class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || this.getSystemTheme();
        this.init();
    }

    init() {
        // Set initial theme
        this.applyTheme(this.theme);
        
        // Setup theme toggle
        this.setupToggle();
        
        // Listen for system theme changes
        this.setupSystemThemeListener();
    }

    getSystemTheme() {
        // Check if user prefers dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    setupToggle() {
        const toggle = document.querySelector('.nav__theme-toggle');
        if (toggle) {
            // Update toggle icon based on current theme
            this.updateToggleIcon(toggle);
            
            // Add click handler
            toggle.addEventListener('click', () => {
                this.theme = this.theme === 'light' ? 'dark' : 'light';
                this.applyTheme(this.theme);
                this.updateToggleIcon(toggle);
            });
        }
    }

    setupSystemThemeListener() {
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', e => {
                    if (!localStorage.getItem('theme')) {
                        // Only auto-switch if user hasn't manually set a theme
                        this.theme = e.matches ? 'dark' : 'light';
                        this.applyTheme(this.theme);
                        this.updateToggleIcon(document.querySelector('.nav__theme-toggle'));
                    }
                });
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', 
                theme === 'dark' ? '#1A1A1A' : '#FFFFFF'
            );
        }
    }

    updateToggleIcon(toggle) {
        if (!toggle) return;

        // Update aria-label
        toggle.setAttribute('aria-label', 
            `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`
        );

        // Update icon SVG
        if (this.theme === 'light') {
            toggle.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2.5V1.5M10 18.5V17.5M17.5 10H18.5M1.5 10H2.5M15.3033 4.6967L16.0104 3.9896M3.9896 16.0104L4.6967 15.3033M15.3033 15.3033L16.0104 16.0104M3.9896 3.9896L4.6967 4.6967M13.5 10C13.5 11.933 11.933 13.5 10 13.5C8.067 13.5 6.5 11.933 6.5 10C6.5 8.067 8.067 6.5 10 6.5C11.933 6.5 13.5 8.067 13.5 10Z" 
                    stroke="currentColor" 
                    stroke-width="1.5" 
                    stroke-linecap="round"/>
                </svg>`;
        } else {
            toggle.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2.5C6.41015 2.5 3.5 5.41015 3.5 9C3.5 12.5899 6.41015 15.5 10 15.5C10.6381 15.5 11.2554 15.4097 11.8399 15.2412C10.7763 13.9425 10.1667 12.3314 10.1667 10.5833C10.1667 7.64239 11.9927 5.10463 14.6412 3.97572C13.3272 3.05077 11.7312 2.5 10 2.5Z" 
                    stroke="currentColor" 
                    stroke-width="1.5" 
                    stroke-linecap="round"/>
                </svg>`;
        }
    }
}