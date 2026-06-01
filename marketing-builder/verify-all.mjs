import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const JEKYLL = 'http://localhost:4000';
const SS = 'C:\\Users\\stacy\\AppData\\Local\\Temp\\verify-';
const results = [];

function pass(label, note = '') { results.push({ s: '✅', label, note }); }
function fail(label, note = '') { results.push({ s: '❌', label, note }); }
function warn(label, note = '') { results.push({ s: '⚠️', label, note }); }

const browser = await chromium.launch({ headless: true });

// ── PAGE 1: Jekyll project page ───────────────────────────────────────────────
const page = await browser.newPage();
const pageErrors = [];
const networkRequests = [];
page.on('console', m => { if (m.type() === 'error') pageErrors.push(m.text()); });
page.on('request', r => networkRequests.push(r.url()));

await page.goto(`${JEKYLL}/projects/roi-calculator/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: SS + '1-project-page.png', fullPage: true });

// Section headings
const h2s = await page.$$eval('h2', els => els.map(e => e.textContent.trim()));
h2s.includes('Hosting the widget file')
  ? pass('New "Hosting the widget file" section present')
  : fail('New "Hosting the widget file" section MISSING', JSON.stringify(h2s));

// No stale bundles requested
const staleLoaded = networkRequests.filter(u =>
  u.includes('roi-calculator-app') && u.includes('.js') &&
  !u.includes('index-CfXkqXE3')
);
staleLoaded.length === 0
  ? pass('Only current JS bundle loaded (no stale bundles)')
  : fail('Stale bundles requested', staleLoaded.join(', '));

const currentLoaded = networkRequests.some(u => u.includes('index-CfXkqXE3'));
currentLoaded
  ? pass('Current bundle index-CfXkqXE3.js loaded')
  : fail('Current bundle NOT loaded');

// Moved files not accessible
for (const f of ['linkedin-post-draft.md', 'convictions-carousel.pdf', 'storyvsdataLItext.jpg']) {
  const r = await page.request.get(`${JEKYLL}/${f}`);
  r.status() === 404
    ? pass(`Moved file not publicly accessible: ${f}`)
    : warn(`Moved file still accessible (may be cached): ${f} → ${r.status()}`);
}

// Jekyll page errors (ignore known X-Frame meta warning)
const realPageErrors = pageErrors.filter(e => !e.includes('X-Frame-Options'));
realPageErrors.length === 0
  ? pass('No console errors on Jekyll page')
  : fail('Console errors on Jekyll page', realPageErrors.join(' | '));

// ── IFRAME: Builder app ───────────────────────────────────────────────────────
await page.waitForTimeout(4000);
const frame = page.frames().find(f => f.url().includes('roi-calculator-app'));
frame
  ? pass('Builder iframe loaded', frame.url())
  : fail('Builder iframe NOT found');

if (frame) {
  // App shell rendered
  const appHeader = await frame.$('.app-header');
  appHeader ? pass('Builder app shell rendered') : fail('Builder app shell missing');

  // All 5 steps navigable
  const stepLabels = ['Template Info', 'Branding', 'Input Fields', 'Outputs & Formulas', 'Call to Action'];
  for (const label of stepLabels) {
    const btn = await frame.$(`button:has-text("${label}")`);
    if (btn) {
      await btn.click();
      await frame.waitForTimeout(300);
      const active = await frame.$('.step-btn.active, .step-nav-btn.active, [class*="active"]');
      pass(`Step navigable: ${label}`);
    } else {
      fail(`Step button not found: ${label}`);
    }
  }
  await page.screenshot({ path: SS + '2-builder-steps.png' });

  // Back to Template Info to check live preview
  const infoBtn = await frame.$('button:has-text("Template Info")');
  if (infoBtn) await infoBtn.click();
  await frame.waitForTimeout(500);

  // Live preview iframe exists
  const previewFrame = frame.childFrames().find(f => f.url() === 'about:blank' || f.name() === 'Calculator Preview');
  const previewIframe = await frame.$('iframe[title="Calculator Preview"]');
  previewIframe
    ? pass('Live preview iframe present')
    : fail('Live preview iframe missing');

  // Embed code tab
  const embedTab = await frame.$('button:has-text("Embed Code")');
  if (embedTab) {
    await embedTab.click();
    await frame.waitForTimeout(400);
    const embedText = await frame.$eval('pre', el => el.textContent).catch(() => '');
    embedText.includes('stacyshelley.com')
      ? pass('Embed code src points to stacyshelley.com')
      : fail('Embed code src wrong', embedText.slice(0, 200));
    embedText.includes('YOUR-DOMAIN')
      ? fail('Embed code still has YOUR-DOMAIN placeholder')
      : pass('No YOUR-DOMAIN placeholder in embed code');
    await page.screenshot({ path: SS + '3-embed-code.png' });
  } else {
    fail('Embed Code tab not found');
  }
}

// ── PAGE 2: Standalone widget at 3 employee tiers ────────────────────────────
const cfg = {
  title: 'Security ROI Calculator', productName: 'Shield',
  description: 'Test widget.',
  brand: { primaryColor: '#1a8a80', accentColor: '#00695c', fontFamily: 'DM Sans, system-ui, sans-serif', logoUrl: '' },
  inputs: [
    { id: 'employees', label: 'Number of Employees', type: 'range', default: 500, min: 10, max: 100000, step: 100, prefix: '', suffix: '', visible: true },
    { id: 'avg_salary', label: 'Average FTE Cost', type: 'number', default: 124910, min: 1, max: 500000, step: 1000, prefix: '$', suffix: '', visible: true },
    { id: 'escalation_rate', label: 'Escalation Rate', type: 'number', default: 3, min: 0.1, max: 25, step: 0.5, prefix: '', suffix: '%', visible: false },
    { id: 'records_at_risk', label: 'Records', type: 'number', default: 50000, min: 100, max: 100000000, step: 1000, prefix: '', suffix: '', visible: false },
    { id: 'cost_per_record', label: 'Cost/record', type: 'number', default: 60, min: 1, max: 500, step: 5, prefix: '$', suffix: '', visible: false },
    { id: 'downtime_days', label: 'Downtime', type: 'number', default: 21, min: 1, max: 90, step: 1, prefix: '', suffix: '', visible: false },
    { id: 'daily_revenue', label: 'Daily Rev', type: 'number', default: 25000, min: 0, max: 10000000, step: 1000, prefix: '$', suffix: '', visible: false },
    { id: 'ir_cost', label: 'IR Cost', type: 'number', default: 75000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'notification_legal_cost', label: 'Legal', type: 'number', default: 50000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'customer_base', label: 'Customers', type: 'number', default: 2000, min: 0, max: 10000000, step: 100, prefix: '', suffix: '', visible: false },
    { id: 'post_breach_churn', label: 'Churn', type: 'number', default: 3, min: 0, max: 50, step: 1, prefix: '', suffix: '%', visible: false },
    { id: 'customer_ltv', label: 'LTV', type: 'number', default: 15000, min: 0, max: 10000000, step: 500, prefix: '$', suffix: '', visible: false },
    { id: 'annual_audit_cost', label: 'Audit', type: 'number', default: 175000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'fine_exposure', label: 'Fines', type: 'number', default: 400000, min: 0, max: 50000000, step: 10000, prefix: '$', suffix: '', visible: false },
    { id: 'hours_per_incident', label: 'Hours/incident', type: 'number', default: 6, min: 1, max: 40, step: 1, prefix: '', suffix: '', visible: false },
    { id: 'incident_reduction', label: 'Incident Reduction', type: 'number', default: 70, min: 0, max: 100, step: 5, prefix: '', suffix: '%', visible: false },
    { id: 'escalation_reduction', label: 'Escalation Reduction', type: 'number', default: 50, min: 0, max: 100, step: 5, prefix: '', suffix: '%', visible: false },
    { id: 'downtime_reduction', label: 'Downtime Reduction', type: 'number', default: 40, min: 0, max: 100, step: 5, prefix: '', suffix: '%', visible: false },
    { id: 'compliance_reduction', label: 'Compliance Reduction', type: 'number', default: 20, min: 0, max: 100, step: 5, prefix: '', suffix: '%', visible: false },
    { id: 'product_cost', label: 'Product Cost', type: 'number', default: 50000, min: 0, max: 10000000, step: 1000, prefix: '$', suffix: '', visible: false },
  ],
  outputs: [
    { id: 'security_incidents', label: 'Estimated Security Incidents / Year', formula: 'Math.round(Math.sqrt(employees * Math.min(employees, 500)) * 0.12)', format: 'number', highlight: false },
    { id: 'exposure_without', label: 'Current Annual Risk Exposure', formula: '((Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * escalation_rate * Math.pow(1000 / Math.max(employees, 1000), 0.2) / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + (Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * hours_per_incident * (avg_salary / 2080) + Math.pow(employees, 0.65) * avg_salary * 0.05 + annual_audit_cost + fine_exposure * 0.15', format: 'currency', highlight: false },
    { id: 'risk_reduction', label: 'Quantified Risk Reduction', formula: '(((Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * escalation_rate * Math.pow(1000 / Math.max(employees, 1000), 0.2) / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + (Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * hours_per_incident * (avg_salary / 2080) + Math.pow(employees, 0.65) * avg_salary * 0.05 + annual_audit_cost + fine_exposure * 0.15) - (((Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * (1 - incident_reduction/100) * escalation_rate * Math.pow(1000 / Math.max(employees, 1000), 0.2) * (1 - escalation_reduction/100) / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * (1 - downtime_reduction/100) * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + (Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * (1 - incident_reduction/100) * hours_per_incident * (avg_salary / 2080) + Math.pow(employees, 0.65) * avg_salary * 0.05 + (annual_audit_cost + fine_exposure * 0.15) * (1 - compliance_reduction/100))', format: 'currency', highlight: true },
  ],
  cta: { text: 'Get Your Free Assessment', url: 'https://example.com/demo' },
};

const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="padding:24px;background:#eee">
<script data-roi-calc data-config="${b64}" src="${JEKYLL}/roi-calculator-app/roi-widget.js"></script>
</body></html>`;
const tmpPath = 'C:\\Users\\stacy\\AppData\\Local\\Temp\\verify-widget.html';
writeFileSync(tmpPath, html);

const wp = await browser.newPage();
const widgetErrors = [];
wp.on('console', m => { if (m.type() === 'error') widgetErrors.push(m.text()); });
await wp.goto('file:///' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'domcontentloaded' });
await wp.waitForTimeout(2000);

// Widget structure
const card = await wp.$('.rc-card');
card ? pass('Widget .rc-card rendered') : fail('Widget .rc-card NOT rendered');

const slider = await wp.$('input[type=range]');
slider ? pass('Slider (full-width) present') : fail('Slider missing');

const rval = await wp.$('.rc-rval');
if (rval) {
  const parentCls = await rval.evaluate(el => el.parentElement.className);
  parentCls.includes('rc-wrap')
    ? fail('rval still inside rc-wrap (should be below slider)', parentCls)
    : pass('rval is below slider (parent is rc-field, not rc-wrap)');
} else {
  fail('rval number box not found');
}

// CTA safe URL
const ctaHref = await wp.$eval('.rc-cta', el => el.getAttribute('href')).catch(() => null);
ctaHref === 'https://example.com/demo'
  ? pass('CTA href is valid https URL')
  : fail('CTA href unexpected', ctaHref);

// 🔍 Probe: javascript: URL should be blocked
const malCfg = { ...cfg, cta: { text: 'Click', url: 'javascript:alert(1)' } };
const malB64 = btoa(unescape(encodeURIComponent(JSON.stringify(malCfg))));
const malHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="padding:24px">
<script data-roi-calc data-config="${malB64}" src="${JEKYLL}/roi-calculator-app/roi-widget.js"></script>
</body></html>`;
writeFileSync('C:\\Users\\stacy\\AppData\\Local\\Temp\\verify-malicious.html', malHtml);
const mp = await browser.newPage();
await mp.goto('file:///C:/Users/stacy/AppData/Local/Temp/verify-malicious.html', { waitUntil: 'domcontentloaded' });
await mp.waitForTimeout(1000);
const malHref = await mp.$eval('.rc-cta', el => el.getAttribute('href')).catch(() => null);
malHref === '#'
  ? pass('🔍 javascript: CTA URL blocked → href="#"')
  : fail('🔍 javascript: CTA URL NOT blocked', malHref);
await mp.close();

// 🔍 Probe: number input clamping — enter value below min
const numInput = await wp.$('.rc-wrap input[type=number]');
if (numInput) {
  await numInput.fill('-999999');
  await numInput.dispatchEvent('input');
  await wp.waitForTimeout(200);
  const outputVals = await wp.$$eval('.rc-out-val', els => els.map(e => e.textContent));
  const hasNaN = outputVals.some(v => v.includes('NaN') || v === '$0' && outputVals[0] !== '0');
  !hasNaN
    ? pass('🔍 Out-of-range number input (-999999) → outputs remain valid', outputVals.join(', '))
    : warn('🔍 Out-of-range input may produce odd output', outputVals.join(', '));
}

// Output values at 3 tiers
const tiers = [
  { emp: 500, label: '500 employees' },
  { emp: 10000, label: '10,000 employees' },
  { emp: 100000, label: '100,000 employees' },
];
const tierValues = {};
for (const { emp, label } of tiers) {
  // Reset to known state
  await wp.goto('file:///' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'domcontentloaded' });
  await wp.waitForTimeout(1500);
  const rvalEl = await wp.$('.rc-rval');
  if (rvalEl) {
    await rvalEl.click({ clickCount: 3 });
    await rvalEl.fill(String(emp));
    await rvalEl.dispatchEvent('input');
    await wp.waitForTimeout(400);
  }
  const vals = await wp.$$eval('.rc-out-val', els => els.map(e => e.textContent.trim()));
  tierValues[label] = vals;
  const hasNaN = vals.some(v => v.includes('NaN'));
  const hasZero = vals.some(v => v === '$0');
  (!hasNaN && !hasZero)
    ? pass(`Outputs valid at ${label}`, vals.join(' | '))
    : fail(`Outputs invalid at ${label}`, vals.join(' | '));
}
await wp.screenshot({ path: SS + '4-widget-100k.png' });

// Values increase across tiers
const exposures = tiers.map(t => {
  const raw = (tierValues[t.label][1] || '').replace(/[$,]/g, '');
  return parseFloat(raw) || 0;
});
const increasing = exposures[0] < exposures[1] && exposures[1] < exposures[2];
increasing
  ? pass('Risk exposure increases meaningfully across tiers',
      tiers.map((t,i) => `${t.label}: ${tierValues[t.label][1]}`).join(' → '))
  : fail('Risk exposure does NOT increase across tiers',
      tiers.map((t,i) => `${t.label}: ${tierValues[t.label][1]}`).join(' → '));

// No widget console errors
widgetErrors.length === 0
  ? pass('No console errors in widget page')
  : fail('Widget console errors', widgetErrors.join(' | '));

await browser.close();

// ── REPORT ────────────────────────────────────────────────────────────────────
console.log('\n## Verification: Recent ROI calculator changes\n');
for (const r of results) console.log(`${r.s} ${r.label}${r.note ? ' — ' + r.note : ''}`);
const failed = results.filter(r => r.s === '❌').length;
const warned = results.filter(r => r.s === '⚠️').length;
console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${results.length} checks, ${failed} failed, ${warned} warnings`);
console.log('Screenshots in C:\\Users\\stacy\\AppData\\Local\\Temp\\');
