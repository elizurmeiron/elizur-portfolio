/**
 * Builds assets/lanuages/translations.js from en.json + he.json.
 * Run after editing language files: node build-i18n.js
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets', 'lanuages');
const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));
const he = JSON.parse(fs.readFileSync(path.join(dir, 'he.json'), 'utf8'));

const out = path.join(dir, 'translations.js');
const body = `/* Auto-generated from en.json / he.json — run: node build-i18n.js */\nwindow.PORTFOLIO_I18N = ${JSON.stringify({ en, he })};\n`;

fs.writeFileSync(out, body, 'utf8');
console.log(`Wrote ${out}`);
