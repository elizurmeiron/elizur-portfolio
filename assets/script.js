'use strict';

const THEME_STORAGE_KEY = 'portfolio-theme';
const MOBILE_BREAKPOINT = 768;

const getStoredTheme = () => window.localStorage.getItem(THEME_STORAGE_KEY);

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

const getPreferredTheme = () => getStoredTheme() ?? getSystemTheme();

const updateThemeToggle = (themeToggle, theme) => {
  if (!themeToggle) {
    return;
  }

  const nextTheme = theme === 'light' ? 'dark' : 'light';
  const icon = themeToggle.querySelector('.theme-toggle-icon');
  const label = themeToggle.querySelector('.theme-toggle-label');

  themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  themeToggle.setAttribute('title', `Switch to ${nextTheme} theme`);
  themeToggle.setAttribute('aria-pressed', String(theme === 'light'));

  if (icon) {
    icon.textContent = theme === 'light' ? '☀' : '☾';
  }

  if (label) {
    label.textContent = theme === 'light' ? 'Light' : 'Dark';
  }
};

const applyTheme = (theme, themeToggle) => {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeToggle(themeToggle, theme);
};

const initializeTheme = (themeToggle) => {
  applyTheme(getPreferredTheme(), themeToggle);

  themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme, themeToggle);
  });

  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  const handleThemeChange = (event) => {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? 'light' : 'dark', themeToggle);
    }
  };

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleThemeChange);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handleThemeChange);
  }
};

const initializeMobileNavigation = (navToggle, navMenu) => {
  if (!navToggle || !navMenu) {
    return;
  }

  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('nav-open');
  };

  const toggleMenu = () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navMenu.classList.toggle('nav-open', !isOpen);
  };

  navToggle.addEventListener('click', toggleMenu);

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        closeMenu();
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');
  const themeToggle = document.querySelector('.theme-toggle');

  initializeTheme(themeToggle);
  initializeMobileNavigation(navToggle, navMenu);
});
