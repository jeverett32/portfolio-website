function applyTheme(colors) {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(colors)) {
        const cssVar = '--' + key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        root.style.setProperty(cssVar, value);
    }
}

function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (!savedTheme) return;
    try {
        applyTheme(JSON.parse(savedTheme));
    } catch (error) {
        console.error('Failed to parse saved theme:', error);
    }
}

window.addEventListener('storage', (event) => {
    if (event.key !== 'portfolioTheme' || !event.newValue) return;
    try {
        applyTheme(JSON.parse(event.newValue));
    } catch (error) {
        console.error('Failed to apply theme from storage:', error);
    }
});

loadThemeFromStorage();
