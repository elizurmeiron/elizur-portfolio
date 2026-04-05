/**
 * Portfolio — main script
 * ES2024+ · no dependencies · loaded with `defer`
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

/** Cache loaded dictionaries so each locale is fetched at most once. */
const translationCache = new Map();

/**
 * Bundled fallback dictionaries so language switching also works when the site
 * is opened directly from disk via `file://` (where fetch is blocked by CORS).
 */
const FALLBACK_TRANSLATIONS = {
  en: {
    "nav_about": "About",
    "nav_experience": "Experience",
    "nav_skills": "Skills",
    "nav_contact": "Contact",
    "sr_new_tab": " (opens in new tab)",
    "skip_link": "Skip to content",

    "hero_location": "Tel Aviv, Israel",
    "hero_desc": "Senior Full-Stack Team Lead with 14+ years building production-grade systems and leading engineering teams. Specializes in multi-agent AI orchestration, microservices architecture, and TypeScript full-stack delivery. Background in cybersecurity engineering and elite IDF special forces service.",
    "tag_team_lead": "Team Lead",
    "tag_microservices": "Microservices",
    "tag_cybersecurity": "Cybersecurity",
    "hero_cta": "Get in touch →",
    "profile_alt": "Elizur Mach — headshot photo",

    "stat_years": "Years experience",
    "stat_mentored": "Developers mentored",
    "stat_shipped": "Systems shipped",
    "stat_pedigree": "Client pedigree",

    "section_about": "01 / About",
    "section_experience": "02 / Experience",
    "section_skills": "03 / Skills",
    "section_contact": "04 / Contact",

    "about_p1": "I lead engineering teams and build the systems they ship. Over 14 years I've moved between full-stack development, people leadership, consulting, and AI-augmented development — always staying hands-on in the code while expanding what the team around me can do.",
    "about_p2": "At <strong>BMC Software</strong>, I co-led platform development as a two-person founding team and engineered a <strong>multi-agent AI orchestration system</strong> — coordinating specialized agents for autonomous engineering workflows without human intervention. At <strong>Checkmarx</strong>, I worked embedded inside one of the world's leading application security companies, breaking apart a monolith into microservices alongside their DevOps team.",
    "about_p3": "As a <strong>Senior Developer &amp; Lecturer at Sela College</strong>, I led a 10-person engineering team, defined technical standards across the organization, and taught advanced React, Node.js, TypeScript, and architecture to 400+ developers — shaping how they think about software, not just how they write it.",
    "about_p4": "Before engineering, I served in <strong>Palsar Golani</strong> — the special forces reconnaissance unit of the Golani Brigade. That background shapes how I approach high-stakes engineering work.",

    "hl_ai_title": "Multi-Agent AI",
    "hl_ai_text": "Built autonomous agent orchestration at BMC — specialized agents coordinating for complex engineering tasks without human intervention.",
    "hl_cyber_title": "Cybersecurity Engineering",
    "hl_cyber_text": "Contractor at Checkmarx (global AppSec leader) — microservices migration, DevOps collaboration, security-focused engineering culture.",
    "hl_lead_title": "Team Leadership",
    "hl_lead_text": "Led 10-person development teams and mentored 400+ developers across corporate and academic environments.",
    "hl_idf_title": "Palsar Golani — <abbr title=\"Israel Defense Forces\">IDF</abbr>",
    "hl_idf_text": "Special forces infantry reconnaissance unit of the Golani Brigade. <abbr title=\"Israel Defense Forces\">IDF</abbr> disabled veteran.",

    "exp_present": "Present",
    "exp_previous": "Previous",

    "exp_bmc_role": "Frontend Infra & Design Systems Engineer — Contractor (via Sela Group)",
    "exp_bmc_b1": "Architected a multi-agent AI orchestration system — coordinating specialized agents for design parsing, architecture planning, code generation, and review, operating autonomously without human intervention.",
    "exp_bmc_b2": "Co-built an enterprise Angular component library from scratch as a two-person team, defining APIs, code standards, and component architecture consumed across enterprise-scale screens.",
    "exp_bmc_b3": "Engineered an AI-powered pipeline integrating Figma Code Connect with an Nx monorepo, generating type-safe screens directly from design references.",

    "exp_sela_role": "Senior Full-Stack Developer & Lecturer",
    "exp_sela_b1": "Led and mentored a 10-person development team — code reviews, agile delivery, technical standards — improving project velocity by 30%.",
    "exp_sela_b2": "Designed and delivered advanced courses in React, Node.js, TypeScript, clean architecture, and Azure to 400+ developers with a 95% satisfaction rate.",
    "exp_sela_b3": "Engineered and deployed 20+ scalable full-stack applications using Node.js, React, and AWS.",
    "exp_sela_b4": "<strong>Checkmarx (<time datetime=\"2018-07\">07/2018</time>–<time datetime=\"2019-08\">08/2019</time>):</strong> Contracted to the global AppSec leader — decomposed a large monolith into microservices, collaborated with DevOps on CI/CD, modernized ASPX with React.",

    "exp_ituran_role": "Full-Stack Developer",
    "exp_ituran_b1": "Pioneered React integration into legacy .aspx systems, establishing a modernization path for the frontend codebase.",
    "exp_ituran_b2": "Integrated AI development tools (Cursor, GitHub Copilot) — accelerating team delivery and establishing AI-assisted workflow best practices.",

    "exp_landa_role": "Full-Stack Developer",
    "exp_landa_b1": "Led DevOps migration from TFS to Azure DevOps as dedicated developer.",
    "exp_landa_b2": "Modernized legacy C++ codebase for .NET Core CI/CD pipeline integration — manufacturing systems domain.",

    "exp_nucleix_role": "Full-Stack Developer",
    "exp_nucleix_b1": "Built a <abbr title=\"Health Insurance Portability and Accountability Act\">HIPAA</abbr>/<abbr title=\"Food and Drug Administration\">FDA</abbr>-compliant production SaaS platform for US biotech operations — Node.js backend, Angular frontend, enterprise security layer for sensitive lab and patient data.",

    "exp_ncr_role": "Senior Full-Stack Developer",
    "exp_ncr_b1": "Led team developing high-volume retail <abbr title=\"Point of Sale\">POS</abbr> system for major US/Canadian clients — C# and ASP.NET backend.",
    "exp_ncr_b2": "Worked with RabbitMQ for message-queue-based service communication in financial transaction systems.",
    "exp_ncr_b3": "Resolved critical SQL data consistency issues in production financial systems.",

    "exp_intel_role": "Software Engineer",
    "exp_intel_b1": "Designed and developed a Coded UI automated testing framework independently — built reusable testing infrastructure standardizing QA processes across enterprise software.",

    "skill_lang": "Languages & Frameworks",
    "skill_infra": "Infrastructure & Cloud",
    "skill_data": "Data & Messaging",
    "skill_ai": "AI & Tooling",
    "skill_arch": "Architecture",
    "skill_lead": "Leadership",

    "skill_item_ci": "CI/CD (Azure DevOps, GitHub Actions)",
    "skill_item_rest": "REST API Design",
    "skill_item_orchestration": "Multi-Agent Orchestration",
    "skill_item_llm": "LLM Integration / GenAI",
    "skill_item_prompt": "Prompt Engineering",
    "skill_item_micro_design": "Microservices Design",
    "skill_item_design_sys": "Design Systems",
    "skill_item_eda": "Event-Driven Architecture",
    "skill_item_team_lead": "Team Lead (10-person teams)",
    "skill_item_review": "Code Review & Standards",
    "skill_item_mentoring": "Technical Mentoring",
    "skill_item_curriculum": "Curriculum Development",

    "contact_title": "Let's talk.",
    "contact_desc": "Open to senior full-stack, team lead, and tech lead roles in Tel Aviv and remote. Direct contact is best — no recruiters needed.",
    "contact_email_label": "Email",
    "contact_email_reveal": "Click to reveal",
    "contact_phone_label": "Phone",
    "contact_location_label": "Location",
    "contact_location_value": "Tel Aviv, Israel",

    "footer": "© <time datetime=\"2026\">2026</time> Elizur Mach. All rights reserved."
  },
  he: {
    "nav_about": "אודות",
    "nav_experience": "ניסיון",
    "nav_skills": "מיומנויות",
    "nav_contact": "יצירת קשר",
    "sr_new_tab": " (נפתח בלשונית חדשה)",
    "skip_link": "דלג לתוכן",

    "hero_location": "תל אביב, ישראל",
    "hero_desc": "מוביל טכני וראש צוות Full-Stack בכיר עם 14+ שנות ניסיון בבניית מערכות ייצור מתקדמות והובלת צוותי פיתוח. מתמחה באורקסטרציית AI מרובת סוכנים, ארכיטקטורת מיקרו-שירותים ופיתוח Full-Stack מבוסס TypeScript. רקע בהנדסת אבטחת מידע ושירות ביחידת כוחות מיוחדים עילית בצה\"ל.",
    "tag_team_lead": "ראש צוות",
    "tag_microservices": "מיקרו-שירותים",
    "tag_cybersecurity": "אבטחת מידע",
    "hero_cta": "← צרו קשר",
    "profile_alt": "אליצור מך — תמונת פרופיל",

    "stat_years": "שנות ניסיון",
    "stat_mentored": "מפתחים שהוכשרו",
    "stat_shipped": "מערכות שנשלחו",
    "stat_pedigree": "רמת לקוחות",

    "section_about": "01 / אודות",
    "section_experience": "02 / ניסיון",
    "section_skills": "03 / מיומנויות",
    "section_contact": "04 / יצירת קשר",

    "about_p1": "אני מוביל צוותי פיתוח ובונה את המערכות שהם מספקים. לאורך 14 שנה עברתי בין פיתוח Full-Stack, הובלת אנשים, ייעוץ ופיתוח מונחה AI — תמיד עם ידיים בקוד תוך הרחבת היכולות של הצוות סביבי.",
    "about_p2": "ב-<strong>BMC Software</strong> הובלתי פיתוח פלטפורמה כצוות מייסד דו-אישי ובניתי <strong>מערכת אורקסטרציית AI מרובת סוכנים</strong> — תיאום סוכנים מתמחים לזרימות עבודה הנדסיות אוטונומיות ללא התערבות אנושית. ב-<strong>Checkmarx</strong> עבדתי משובץ באחת מחברות אבטחת האפליקציות המובילות בעולם, פירקתי מונוליט למיקרו-שירותים לצד צוות ה-DevOps שלהם.",
    "about_p3": "כ<strong>מפתח בכיר ומרצה ב-Sela College</strong>, הובלתי צוות פיתוח של 10 אנשים, הגדרתי תקני טכנולוגיה ברחבי הארגון ולימדתי React, Node.js, TypeScript וארכיטקטורה מתקדמת ל-400+ מפתחים — עיצבתי את דרך החשיבה שלהם על תוכנה, לא רק את דרך הכתיבה.",
    "about_p4": "לפני ההנדסה שירתתי ב<strong>פלסר גולני</strong> — יחידת הסיור המיוחדת של חטיבת גולני. הרקע הזה מעצב את הגישה שלי לעבודה הנדסית בעלת סיכון גבוה.",

    "hl_ai_title": "AI מרובה סוכנים",
    "hl_ai_text": "בניית אורקסטרציית סוכנים אוטונומית ב-BMC — סוכנים מתמחים המתואמים למשימות הנדסיות מורכבות ללא התערבות אנושית.",
    "hl_cyber_title": "הנדסת אבטחת מידע",
    "hl_cyber_text": "קבלן ב-Checkmarx (מובילה עולמית ב-AppSec) — מיגרציה למיקרו-שירותים, שיתוף פעולה עם DevOps, תרבות הנדסית ממוקדת אבטחה.",
    "hl_lead_title": "הובלת צוותים",
    "hl_lead_text": "הובלת צוותי פיתוח של 10 אנשים והכשרת 400+ מפתחים בסביבות ארגוניות ואקדמיות.",
    "hl_idf_title": "פלסר גולני — <abbr title=\"צבא ההגנה לישראל\">צה\"ל</abbr>",
    "hl_idf_text": "יחידת סיור רגלי מיוחדת של חטיבת גולני. נכה <abbr title=\"צבא ההגנה לישראל\">צה\"ל</abbr>.",

    "exp_present": "נוכחי",
    "exp_previous": "קודם",

    "exp_bmc_role": "מהנדס תשתיות Frontend ומערכות עיצוב — קבלן (דרך קבוצת סלע)",
    "exp_bmc_b1": "תכננתי מערכת אורקסטרציית AI מרובת סוכנים — תיאום סוכנים מתמחים לניתוח עיצוב, תכנון ארכיטקטורה, יצירת קוד וסקירה, הפועלים באופן אוטונומי ללא התערבות אנושית.",
    "exp_bmc_b2": "בניתי ספריית רכיבי Angular ארגונית מאפס כצוות דו-אישי, הגדרת API-ים, תקני קוד וארכיטקטורת רכיבים הנצרכת במסכים ברמה ארגונית.",
    "exp_bmc_b3": "פיתחתי צינור מונחה AI המשלב Figma Code Connect עם Nx monorepo, מייצר מסכים בטוחי-טיפוסים ישירות מהפניות עיצוב.",

    "exp_sela_role": "מפתח Full-Stack בכיר ומרצה",
    "exp_sela_b1": "הובלתי והנחיתי צוות פיתוח של 10 אנשים — סקירות קוד, אספקה אג׳ילית, תקנים טכניים — שיפור מהירות הפרויקט ב-30%.",
    "exp_sela_b2": "תכננתי והעברתי קורסים מתקדמים ב-React, Node.js, TypeScript, ארכיטקטורה נקייה ו-Azure ל-400+ מפתחים עם שביעות רצון של 95%.",
    "exp_sela_b3": "פיתחתי ופרסתי 20+ אפליקציות Full-Stack סקיילאביליות באמצעות Node.js, React ו-AWS.",
    "exp_sela_b4": "<strong>Checkmarx (<time datetime=\"2018-07\">07/2018</time>–<time datetime=\"2019-08\">08/2019</time>):</strong> משובץ כקבלן אצל מובילה עולמית ב-AppSec — פירוק מונוליט גדול למיקרו-שירותים, שיתוף פעולה עם DevOps ב-CI/CD, מודרניזציה של ASPX עם React.",

    "exp_ituran_role": "מפתח Full-Stack",
    "exp_ituran_b1": "חלוצי בשילוב React למערכות .aspx ישנות, יצירת נתיב מודרניזציה לקוד ה-Frontend.",
    "exp_ituran_b2": "שילוב כלי פיתוח AI (Cursor, GitHub Copilot) — האצת אספקת הצוות וביסוס שיטות עבודה מיטביות בסיוע AI.",

    "exp_landa_role": "מפתח Full-Stack",
    "exp_landa_b1": "הובלת מיגרציית DevOps מ-TFS ל-Azure DevOps כמפתח ייעודי.",
    "exp_landa_b2": "מודרניזציה של קוד C++ ישן לשילוב צינור CI/CD ב-.NET Core — תחום מערכות ייצור.",

    "exp_nucleix_role": "מפתח Full-Stack",
    "exp_nucleix_b1": "בניית פלטפורמת SaaS תואמת <abbr title=\"Health Insurance Portability and Accountability Act\">HIPAA</abbr>/<abbr title=\"Food and Drug Administration\">FDA</abbr> לתפעול ביוטכנולוגי בארה\"ב — צד שרת Node.js, צד לקוח Angular, שכבת אבטחה ארגונית למידע רגיש של מעבדות ומטופלים.",

    "exp_ncr_role": "מפתח Full-Stack בכיר",
    "exp_ncr_b1": "הובלת צוות לפיתוח מערכת <abbr title=\"Point of Sale\">POS</abbr> קמעונאית בנפח גבוה ללקוחות מרכזיים בארה\"ב/קנדה — צד שרת C# ו-ASP.NET.",
    "exp_ncr_b2": "עבודה עם RabbitMQ לתקשורת שירותים מבוססת תורי הודעות במערכות עסקאות פיננסיות.",
    "exp_ncr_b3": "פתרון בעיות קריטיות של עקביות נתונים ב-SQL במערכות פיננסיות בייצור.",

    "exp_intel_role": "מהנדס תוכנה",
    "exp_intel_b1": "תכנון ופיתוח מסגרת בדיקות אוטומטיות Coded UI באופן עצמאי — בניית תשתית בדיקות ניתנת לשימוש חוזר לסטנדרטיזציה של תהליכי QA בתוכנה ארגונית.",

    "skill_lang": "שפות ופריימוורקים",
    "skill_infra": "תשתיות וענן",
    "skill_data": "נתונים והודעות",
    "skill_ai": "AI וכלים",
    "skill_arch": "ארכיטקטורה",
    "skill_lead": "הובלה",

    "skill_item_ci": "CI/CD (Azure DevOps, GitHub Actions)",
    "skill_item_rest": "עיצוב REST API",
    "skill_item_orchestration": "אורקסטרציית סוכנים מרובים",
    "skill_item_llm": "שילוב LLM / GenAI",
    "skill_item_prompt": "הנדסת פרומפטים",
    "skill_item_micro_design": "עיצוב מיקרו-שירותים",
    "skill_item_design_sys": "מערכות עיצוב",
    "skill_item_eda": "ארכיטקטורה מונחית אירועים",
    "skill_item_team_lead": "ראש צוות (צוותים של 10)",
    "skill_item_review": "סקירת קוד ותקנים",
    "skill_item_mentoring": "מנטורינג טכני",
    "skill_item_curriculum": "פיתוח תכניות לימוד",

    "contact_title": "בואו נדבר.",
    "contact_desc": "פתוח לתפקידי Full-Stack בכיר, ראש צוות ומוביל טכני בתל אביב ועבודה מרחוק. יצירת קשר ישירה עדיפה — ללא מגייסים.",
    "contact_email_label": "אימייל",
    "contact_email_reveal": "לחצו לחשיפה",
    "contact_phone_label": "טלפון",
    "contact_location_label": "מיקום",
    "contact_location_value": "תל אביב, ישראל",

    "footer": "© <time datetime=\"2026\">2026</time> אליצור מך. כל הזכויות שמורות."
  },
};

const loadTranslations = async (lang) => {
  if (translationCache.has(lang)) return translationCache.get(lang);

  const bundledDict = FALLBACK_TRANSLATIONS[lang] ?? null;

  // Local `file://` pages cannot fetch JSON reliably because the browser blocks it.
  if (window.location.protocol === 'file:' && bundledDict) {
    translationCache.set(lang, bundledDict);
    return bundledDict;
  }

  const candidatePaths = [
    `./assets/languages/${lang}.json`,
    `./assets/lanuages/${lang}.json`,
  ];

  for (const path of candidatePaths) {
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      const dict = await res.json();
      translationCache.set(lang, dict);
      return dict;
    } catch {
      // Try the next path or bundled fallback.
    }
  }

  if (bundledDict) {
    console.warn(`[i18n] Falling back to bundled "${lang}" translations.`);
    translationCache.set(lang, bundledDict);
    return bundledDict;
  }

  console.error(`[i18n] Failed to load "${lang}" translations.`);
  return null;
};

/* Keys whose translations contain HTML (strong, abbr, time tags) */
const HTML_KEYS = new Set([
  'about_p2', 'about_p3', 'about_p4',
  'hl_idf_title', 'hl_idf_text',
  'exp_sela_b4', 'exp_nucleix_b1', 'exp_ncr_b1',
  'footer',
]);

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

  const next = theme === 'light' ? 'dark' : 'light';
  const icon = toggle.querySelector('.theme-toggle-icon');
  const label = toggle.querySelector('.theme-toggle-label');

  toggle.setAttribute('aria-label', `Switch to ${next} theme`);
  toggle.setAttribute('title', `Switch to ${next} theme`);
  toggle.setAttribute('aria-pressed', String(theme === 'light'));

  if (icon) icon.textContent = theme === 'light' ? '\u2600' : '\u263E';
  if (label) label.textContent = theme === 'light' ? 'Light' : 'Dark';
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

const applyLang = async (lang) => {
  const root = document.documentElement;
  const dict = await loadTranslations(lang);
  if (!dict) return;

  // Set html lang & dir
  root.lang = lang;
  root.dir = lang === 'he' ? 'rtl' : 'ltr';

  // Update all [data-i18n] elements
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const key = el.dataset.i18n;
    const value = dict[key];
    if (value == null) continue;

    if (HTML_KEYS.has(key)) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  }

  // Update [data-i18n-alt] elements (image alt text)
  for (const el of document.querySelectorAll('[data-i18n-alt]')) {
    const key = el.dataset.i18nAlt;
    const value = dict[key];
    if (value != null) el.alt = value;
  }

  // Re-decode emails if they were already revealed
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
  if (!toggle) return;
  const label = toggle.querySelector('.lang-toggle-label');

  if (currentLang === 'en') {
    toggle.setAttribute('aria-label', '\u05E2\u05D1\u05E8\u05D9\u05EA \u2014 switch to Hebrew');
    toggle.setAttribute('title', '\u05E2\u05D1\u05E8\u05D9\u05EA \u2014 switch to Hebrew');
    if (label) label.textContent = '\u05E2\u05D1';
  } else {
    toggle.setAttribute('aria-label', 'English \u2014 switch to English');
    toggle.setAttribute('title', 'English \u2014 switch to English');
    if (label) label.textContent = 'EN';
  }
};

const initLang = async (toggle) => {
  const preferred = storage.get(LANG_STORAGE_KEY) ?? 'en';
  await applyLang(preferred);
  updateLangToggle(toggle, preferred);

  toggle?.addEventListener('click', async () => {
    const current = document.documentElement.lang || 'en';
    const next = current === 'en' ? 'he' : 'en';
    storage.set(LANG_STORAGE_KEY, next);
    await applyLang(next);
    updateLangToggle(toggle, next);
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
initTheme(themeToggle);
initMobileNav(navToggle, navMenu);
initInPageLinks();
initActiveNavTracking();

// Async boot — apply saved language, then prefetch the alternate locale
(async () => {
  await initLang(langToggle);

  // Warm the cache for instant switching
  const alt = (document.documentElement.lang || 'en') === 'en' ? 'he' : 'en';
  loadTranslations(alt);
})();
