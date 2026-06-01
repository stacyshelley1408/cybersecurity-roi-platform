import { chromium } from 'playwright';

const LIVE = 'https://stacyshelley.com';
const SS = 'C:\\Users\\stacy\\AppData\\Local\\Temp\\live-';
const results = [];

function pass(label, note = '') { results.push({ s: '✅', label, note }); console.log(`✅ ${label}${note ? ' — ' + note : ''}`); }
function fail(label, note = '') { results.push({ s: '❌', label, note }); console.log(`❌ ${label}${note ? ' — ' + note : ''}`); }
function warn(label, note = '') { results.push({ s: '⚠️', label, note }); console.log(`⚠️  ${label}${note ? ' — ' + note : ''}`); }

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

// ── 1. Page loads ─────────────────────────────────────────────────────────────
console.log('\nChecking live site...\n');
const res = await page.goto(`${LIVE}/projects/roi-calculator/`, { waitUntil: 'networkidle', timeout: 30000 });
res.status() === 200
  ? pass('Page returns 200')
  : fail('Page status unexpected', String(res.status()));

await page.screenshot({ path: SS + '1-page-top.png', fullPage: false });

// ── 2. Copy — no em dashes, correct sections ──────────────────────────────────
const bodyText = await page.$eval('body', el => el.innerText);
bodyText.includes('—')
  ? fail('Em dash found in page text')
  : pass('No em dashes in page copy');

const h2s = await page.$$eval('h2', els => els.map(e => e.textContent.trim()));
const expectedH2s = ['What it is', 'The cost model', 'How to use it', 'Hosting the widget file'];
for (const h of expectedH2s) {
  h2s.includes(h) ? pass(`Section present: "${h}"`) : fail(`Section MISSING: "${h}"`);
}

// ── 3. Builder iframe loads ───────────────────────────────────────────────────
await page.waitForTimeout(3000);
const iframeEl = await page.$('iframe.proj-app-frame');
iframeEl ? pass('Builder iframe element present') : fail('Builder iframe element missing');

const frame = page.frames().find(f => f.url().includes('roi-calculator-app'));
frame ? pass('Builder iframe loaded', frame.url()) : fail('Builder iframe did NOT load');

if (frame) {
  await frame.waitForSelector('.app-header', { timeout: 10000 }).catch(() => {});
  const appHeader = await frame.$('.app-header');
  appHeader ? pass('Builder app rendered inside iframe') : fail('Builder app NOT rendered inside iframe');
  await page.screenshot({ path: SS + '2-builder-iframe.png' });

  // Embed code shows stacyshelley.com
  const embedTab = await frame.$('button:has-text("Embed Code")');
  if (embedTab) {
    await embedTab.click();
    await frame.waitForTimeout(500);
    const embedText = await frame.$eval('pre', el => el.textContent).catch(() => '');
    embedText.includes('stacyshelley.com')
      ? pass('Embed code src points to stacyshelley.com')
      : fail('Embed code src wrong', embedText.slice(0, 150));
    await page.screenshot({ path: SS + '3-embed-tab.png' });
  }
}

// ── 4. Widget asset accessible ────────────────────────────────────────────────
const widgetRes = await page.request.get(`${LIVE}/roi-calculator-app/roi-widget.js`);
widgetRes.status() === 200
  ? pass('roi-widget.js accessible at stacyshelley.com')
  : fail('roi-widget.js not accessible', String(widgetRes.status()));

const widgetBody = await widgetRes.text();
widgetBody.includes('safeUrl')
  ? pass('roi-widget.js is the latest version (safeUrl present)')
  : fail('roi-widget.js may be stale (safeUrl not found)');

// ── 5. Live widget renders with hosted file ───────────────────────────────────
const cfg = {
  title: 'Security ROI Calculator', productName: 'Shield',
  description: 'Quantify your cybersecurity risk exposure.',
  brand: { primaryColor: '#1a8a80', accentColor: '#00695c', fontFamily: 'DM Sans, system-ui, sans-serif', logoUrl: '' },
  inputs: [
    { id: 'employees', label: 'Number of Employees', type: 'range', default: 500, min: 10, max: 100000, step: 100, prefix: '', suffix: '', visible: true },
    { id: 'avg_salary', label: 'Average FTE Cost', type: 'number', default: 124910, min: 1, max: 500000, step: 1000, prefix: '$', suffix: '', visible: true },
    { id: 'escalation_rate', type: 'number', default: 3, visible: false, id: 'escalation_rate', label: 'Esc', min: 0.1, max: 25, step: 0.5, prefix: '', suffix: '' },
    { id: 'records_at_risk', label: 'Records', type: 'number', default: 50000, min: 100, max: 100000000, step: 1000, prefix: '', suffix: '', visible: false },
    { id: 'cost_per_record', label: 'CPR', type: 'number', default: 60, min: 1, max: 500, step: 5, prefix: '$', suffix: '', visible: false },
    { id: 'downtime_days', label: 'DD', type: 'number', default: 21, min: 1, max: 90, step: 1, prefix: '', suffix: '', visible: false },
    { id: 'daily_revenue', label: 'DR', type: 'number', default: 25000, min: 0, max: 10000000, step: 1000, prefix: '$', suffix: '', visible: false },
    { id: 'ir_cost', label: 'IR', type: 'number', default: 75000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'notification_legal_cost', label: 'NLC', type: 'number', default: 50000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'customer_base', label: 'CB', type: 'number', default: 2000, min: 0, max: 10000000, step: 100, prefix: '', suffix: '', visible: false },
    { id: 'post_breach_churn', label: 'PBC', type: 'number', default: 3, min: 0, max: 50, step: 1, prefix: '', suffix: '', visible: false },
    { id: 'customer_ltv', label: 'LTV', type: 'number', default: 15000, min: 0, max: 10000000, step: 500, prefix: '$', suffix: '', visible: false },
    { id: 'annual_audit_cost', label: 'AAC', type: 'number', default: 175000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'fine_exposure', label: 'FE', type: 'number', default: 400000, min: 0, max: 50000000, step: 10000, prefix: '$', suffix: '', visible: false },
    { id: 'hours_per_incident', label: 'HPI', type: 'number', default: 6, min: 1, max: 40, step: 1, prefix: '', suffix: '', visible: false },
    { id: 'incident_reduction', label: 'IR%', type: 'number', default: 70, min: 0, max: 100, step: 5, prefix: '', suffix: '', visible: false },
    { id: 'escalation_reduction', label: 'ER%', type: 'number', default: 50, min: 0, max: 100, step: 5, prefix: '', suffix: '', visible: false },
    { id: 'downtime_reduction', label: 'DTR%', type: 'number', default: 40, min: 0, max: 100, step: 5, prefix: '', suffix: '', visible: false },
    { id: 'compliance_reduction', label: 'CR%', type: 'number', default: 20, min: 0, max: 100, step: 5, prefix: '', suffix: '', visible: false },
    { id: 'product_cost', label: 'PC', type: 'number', default: 50000, min: 0, max: 10000000, step: 1000, prefix: '$', suffix: '', visible: false },
  ],
  outputs: [
    { id: 'incidents', label: 'Estimated Security Incidents / Year', formula: 'Math.round(Math.sqrt(employees * Math.min(employees, 500)) * 0.12)', format: 'number', highlight: false },
    { id: 'exposure', label: 'Current Annual Risk Exposure', formula: 'Math.pow(employees, 0.65) * avg_salary * 0.05 + 235000', format: 'currency', highlight: true },
  ],
  cta: { text: 'Get Your Free Assessment', url: 'https://stacyshelley.com' },
};

const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));

// Serve widget from live stacyshelley.com
const widgetPage = await browser.newPage();
const widgetErrors = [];
widgetPage.on('console', m => { if (m.type() === 'error') widgetErrors.push(m.text()); });

await widgetPage.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="padding:24px;background:#eee">
<script data-roi-calc data-config="${b64}" src="${LIVE}/roi-calculator-app/roi-widget.js"></script>
</body></html>`, { waitUntil: 'domcontentloaded' });
await widgetPage.waitForTimeout(3000);

const card = await widgetPage.$('.rc-card');
card ? pass('Widget renders from live stacyshelley.com hosted file') : fail('Widget did NOT render from live host');

const slider = await widgetPage.$('input[type=range]');
slider ? pass('Slider present') : fail('Slider missing');

const rval = await widgetPage.$('.rc-rval');
if (rval) {
  const parentCls = await rval.evaluate(el => el.parentElement.className);
  !parentCls.includes('rc-wrap')
    ? pass('Number box is below slider (not inside rc-wrap)')
    : fail('Number box still inside rc-wrap');
}

const outputVals = await widgetPage.$$eval('.rc-out-val', els => els.map(e => e.textContent.trim()));
const hasNaN = outputVals.some(v => v.includes('NaN') || v === '$0');
!hasNaN && outputVals.length > 0
  ? pass('Outputs render with valid values', outputVals.join(' | '))
  : fail('Outputs invalid or missing', outputVals.join(' | '));

// Interact: change employees via rval
if (rval) {
  const before = [...outputVals];
  await rval.click({ clickCount: 3 });
  await rval.fill('25000');
  await rval.dispatchEvent('input');
  await widgetPage.waitForTimeout(400);
  const after = await widgetPage.$$eval('.rc-out-val', els => els.map(e => e.textContent.trim()));
  JSON.stringify(before) !== JSON.stringify(after)
    ? pass('Slider interaction updates outputs', `${before[1]} → ${after[1]}`)
    : fail('Outputs did not change after slider interaction');
}

widgetErrors.length === 0
  ? pass('No console errors from live-hosted widget')
  : fail('Console errors from widget', widgetErrors.join(' | '));

await widgetPage.screenshot({ path: SS + '4-live-widget.png' });

// ── 6. Console errors ─────────────────────────────────────────────────────────
const realErrors = errors.filter(e => !e.includes('X-Frame-Options'));
realErrors.length === 0
  ? pass('No console errors on project page')
  : fail('Console errors on project page', realErrors.join(' | '));

await browser.close();

// ── Report ────────────────────────────────────────────────────────────────────
const failed = results.filter(r => r.s === '❌').length;
const warned = results.filter(r => r.s === '⚠️').length;
console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${results.length} checks, ${failed} failed, ${warned} warnings`);
console.log('Screenshots: ' + SS + '*.png');
