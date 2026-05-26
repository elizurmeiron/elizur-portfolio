/**
 * Portfolio — main script
 * ES2024+ · no dependencies · classic script (works on file:// and GitHub Pages)
 */

const THEME_STORAGE_KEY = 'portfolio-theme';
const LANG_STORAGE_KEY = 'portfolio-lang';
const MOBILE_BREAKPOINT = 768;

/** Shared AbortController — call controller.abort() to tear down all listeners. */
const controller = new AbortController();
const { signal } = controller;

/* ============================================================
   Storage helper — safe for private browsing / sandboxed iframes
   ============================================================ */

const storage = {
  get(key) {
    try { return window.localStorage.getItem(key); }
    catch { return null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); }
    catch { /* storage unavailable — degrade silently */ }
  },
};

/* ============================================================
   i18n — load translations from external JSON resource files
   ============================================================ */

/** Locale dictionaries — loaded by assets/lanuages/translations.js (built from JSON). */
const getTranslationCatalog = () => window.PORTFOLIO_I18N ?? null;

/** Active locale dictionary (used by theme / lang toggle labels). */
let activeTranslations = null;

const normalizeLang = (value) => (value?.toLowerCase().startsWith('he') ? 'he' : 'en');

const loadTranslations = (lang) => {
  const catalog = getTranslationCatalog();
  return catalog?.[lang] ?? null;
};

/* ============================================================
   Email decode — assembles mailto: from data-u / data-d attrs
   ============================================================ */

const decodeEmailLinks = () => {
  for (const el of document.querySelectorAll('.js-email-link')) {
    const u = el.dataset.u;
    const d = el.dataset.d;
    if (!u || !d) continue;

    const addr = `${u}@${d}`;
    el.href = `mailto:${addr}`;

    const text = el.querySelector('.js-email-text');
    if (text) text.textContent = addr;
  }
};

/* ============================================================
   Theme
   ============================================================ */

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

const getPreferredTheme = () => storage.get(THEME_STORAGE_KEY) ?? getSystemTheme();

const applyTheme = (theme, toggle) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;

  if (!toggle) return;

  const t = activeTranslations ?? loadTranslations(normalizeLang(document.documentElement.lang)) ?? {};
  const next = theme === 'light' ? 'dark' : 'light';
  const icon = toggle.querySelector('.theme-toggle-icon');
  const label = toggle.querySelector('.theme-toggle-label');
  const ariaKey = next === 'light' ? 'theme_aria_to_light' : 'theme_aria_to_dark';
  const labelKey = theme === 'light' ? 'theme_label_light' : 'theme_label_dark';
  const ariaText = t[ariaKey] ?? (next === 'light' ? 'Switch to light theme' : 'Switch to dark theme');

  toggle.setAttribute('aria-label', ariaText);
  toggle.setAttribute('title', ariaText);
  toggle.setAttribute('aria-pressed', String(theme === 'light'));

  if (icon) icon.textContent = theme === 'light' ? '\u2600' : '\u263E';
  if (label) label.textContent = t[labelKey] ?? (theme === 'light' ? 'Light' : 'Dark');
};

const initTheme = (toggle) => {
  applyTheme(getPreferredTheme(), toggle);

  toggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') ?? 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    storage.set(THEME_STORAGE_KEY, next);
    applyTheme(next, toggle);
  }, { signal });

  const mq = window.matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', (e) => {
    if (!storage.get(THEME_STORAGE_KEY)) {
      applyTheme(e.matches ? 'light' : 'dark', toggle);
    }
  }, { signal });
};

/* ============================================================
   Language / i18n
   ============================================================ */

const applyLang = (lang) => {
  const root = document.documentElement;
  const dict = loadTranslations(lang);
  if (!dict) return;

  activeTranslations = dict;

  root.lang = lang;
  root.dir = lang === 'he' ? 'rtl' : 'ltr';

  for (const el of document.querySelectorAll('[data-i18n]')) {
    const value = dict[el.dataset.i18n];
    if (value != null) el.textContent = value;
  }

  for (const el of document.querySelectorAll('[data-i18n-html]')) {
    const value = dict[el.dataset.i18nHtml];
    if (value != null) el.innerHTML = value;
  }

  for (const el of document.querySelectorAll('[data-i18n-alt]')) {
    const value = dict[el.dataset.i18nAlt];
    if (value != null) el.alt = value;
  }

  for (const el of document.querySelectorAll('.js-email-link')) {
    if (el.href?.startsWith('mailto:')) {
      const text = el.querySelector('.js-email-text');
      const u = el.dataset.u;
      const d = el.dataset.d;
      if (text && u && d) text.textContent = `${u}@${d}`;
    }
  }
};

const updateLangToggle = (toggle, currentLang) => {
  if (!toggle || !activeTranslations) return;

  const t = activeTranslations;
  const label = toggle.querySelector('.lang-toggle-label');

  if (currentLang === 'en') {
    const aria = t.lang_aria_to_he ?? '';
    toggle.setAttribute('aria-label', aria);
    toggle.setAttribute('title', aria);
    if (label) label.textContent = t.lang_label_he ?? '';
  } else {
    const aria = t.lang_aria_to_en ?? '';
    toggle.setAttribute('aria-label', aria);
    toggle.setAttribute('title', aria);
    if (label) label.textContent = t.lang_label_en ?? '';
  }
};

const initLang = (toggle, themeToggle) => {
  if (!getTranslationCatalog()) {
    console.error('[i18n] Missing translations.js — run: node build-i18n.js');
  }

  const preferred = normalizeLang(storage.get(LANG_STORAGE_KEY) ?? 'en');
  applyLang(preferred);
  updateLangToggle(toggle, preferred);

  const theme = document.documentElement.getAttribute('data-theme') ?? 'dark';
  applyTheme(theme, themeToggle);

  toggle?.addEventListener('click', () => {
    const current = normalizeLang(document.documentElement.lang);
    const next = current === 'en' ? 'he' : 'en';
    storage.set(LANG_STORAGE_KEY, next);
    applyLang(next);
    updateLangToggle(toggle, next);
    applyTheme(document.documentElement.getAttribute('data-theme') ?? 'dark', themeToggle);
  }, { signal });
};

/* ============================================================
   Mobile navigation
   ============================================================ */

const initMobileNav = (toggle, menu) => {
  if (!toggle || !menu) return;

  const nav = toggle.closest('nav');
  const focusableSelector = 'a[href], button, [tabindex]:not([tabindex="-1"])';

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('nav-open');
  };

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('nav-open');

    requestAnimationFrame(() => {
      menu.querySelector('a')?.focus();
    });
  };

  const toggleMenu = () => (isOpen() ? close() : open());

  toggle.addEventListener('click', toggleMenu, { signal });

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a') && window.innerWidth <= MOBILE_BREAKPOINT) {
      close();
    }
  }, { signal });

  document.addEventListener('click', (e) => {
    if (isOpen() && nav && !nav.contains(e.target)) {
      close();
    }
  }, { signal });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      close();
      toggle.focus();
    }
  }, { signal });

  nav?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !isOpen()) return;

    const focusable = [...nav.querySelectorAll(focusableSelector)];
    if (focusable.length === 0) return;

    const first = focusable.at(0);
    const last = focusable.at(-1);

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, { signal });

  window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT + 1}px)`)
    .addEventListener('change', (e) => { if (e.matches) close(); }, { signal });
};

/* ============================================================
   In-page links — avoid `file://` frame navigation warnings
   ============================================================ */

const initInPageLinks = () => {
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    const href = link.getAttribute('href');
    if (!href || href === '#') continue;

    link.addEventListener('click', (e) => {
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (window.location.protocol !== 'file:' && window.history?.replaceState) {
        window.history.replaceState(null, '', `#${id}`);
      }
    }, { signal });
  }
};

/* ============================================================
   Active nav tracking — IntersectionObserver on hero + sections
   ============================================================ */

const initActiveNavTracking = () => {
  const hero = document.querySelector('#hero');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (navLinks.length === 0) return;

  const targets = [...(hero ? [hero] : []), ...sections];
  if (targets.length === 0) return;

  const visible = new Set();

  const setActive = (id) => {
    for (const link of navLinks) {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  const updateActive = () => {
    for (const target of targets) {
      if (visible.has(target.id)) {
        setActive(target.id);
        return;
      }
    }
    setActive('');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.add(entry.target.id);
        } else {
          visible.delete(entry.target.id);
        }
      }
      updateActive();
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
  );

  for (const target of targets) observer.observe(target);
};

/* ============================================================
   Boot
   ============================================================ */

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const langToggle = document.querySelector('.lang-toggle');

decodeEmailLinks();
initMobileNav(navToggle, navMenu);
initInPageLinks();
initActiveNavTracking();

initLang(langToggle, themeToggle);
initTheme(themeToggle);
