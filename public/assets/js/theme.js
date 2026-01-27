/**
 * Theme Toggle - Dark/Light Mode
 */
(function () {
    const THEME_KEY = 'batuhan-blog-theme';

    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        updateToggleIcon(theme);
    }

    function updateToggleIcon(theme) {
        const icon = document.querySelector('.theme-toggle i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }

    // Initialize theme on page load
    function initTheme() {
        const saved = getSavedTheme();
        const theme = saved || getSystemTheme();
        setTheme(theme);
    }

    // Run immediately to prevent flash
    initTheme();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!getSavedTheme()) {
            setTheme(e.matches ? 'light' : 'dark');
        }
    });

    // Expose toggle function globally
    window.toggleTheme = toggleTheme;

    document.addEventListener('click', (e) => {
        const themeBtn = e.target.closest('.theme-toggle');
        if (themeBtn) { toggleTheme(); return; }
        const hamburger = e.target.closest('.admin-hamburger');
        if (hamburger) {
            const links = document.querySelector('.admin-links');
            if (links) links.classList.toggle('active');
        }
    });
})();
