/**
 * Verifies that roi-widget.js embeds correctly across different input/output configurations.
 * Runs against the live widget hosted at stacyshelley.com.
 * Usage: node verify-embed-configs.mjs
 */

import { chromium } from 'playwright';

const WIDGET_SRC = 'https://stacyshelley.com/roi-calculator-app/roi-widget.js';
const results = [];

function pass(label, note = '') { results.push({ s: '✅', label, note }); console.log(`✅ ${label}${note ? ' — ' + note : ''}`); }
function fail(label, note = '') { results.push({ s: '❌', label, note }); console.log(`❌ ${label}${note ? ' — ' + note : ''}`); }

function encode(cfg) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
}

function makeHtml(cfg) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="padding:24px;background:#f0f0f0">
<script data-roi-calc data-config="${encode(cfg)}" src="${WIDGET_SRC}"></script>
</body></html>`;
}

// ── shared inputs for reference ────────────────────────────────────────────────
const RANGE_INPUT = { id: 'employees', label: 'Number of Employees', type: 'range', default: 1000, min: 10, max: 100000, step: 100, prefix: '', suffix: '', visible: true };
const NUMBER_INPUT = { id: 'avg_salary', label: 'Average FTE Cost', type: 'number', default: 100000, min: 1, max: 500000, step: 1000, prefix: '$', suffix: '', visible: true };
const HIDDEN_INPUT = { id: 'cost_per_record', label: 'Cost/record', type: 'number', default: 60, min: 1, max: 500, step: 5, prefix: '$', suffix: '', visible: false };
const HIDDEN_ESCALATION = { id: 'escalation_rate', label: 'Escalation Rate', type: 'number', default: 3, min: 0.1, max: 25, step: 0.5, prefix: '', suffix: '%', visible: false };

const SIMPLE_OUTPUT = { id: 'incidents', label: 'Estimated Incidents / Year', formula: 'Math.round(Math.sqrt(employees * Math.min(employees, 500)) * 0.12)', format: 'number', highlight: false };
const CURRENCY_OUTPUT = { id: 'exposure', label: 'Current Risk Exposure', formula: 'employees * avg_salary * 0.05', format: 'currency', highlight: true };
const PRODUCT_OUTPUT = { id: 'with_product', label: 'Risk With {productName}', formula: 'employees * avg_salary * 0.015', format: 'currency', highlight: false };
const PERCENT_OUTPUT = { id: 'reduction_pct', label: 'Reduction Percentage', formula: '((employees * avg_salary * 0.05 - employees * avg_salary * 0.015) / (employees * avg_salary * 0.05)) * 100', format: 'percent', highlight: false };

const BASE_BRAND = { primaryColor: '#1a8a80', accentColor: '#00695c', fontFamily: 'system-ui, sans-serif', logoUrl: '' };
const BASE_CTA = { text: 'Get a Demo', url: 'https://stacyshelley.com' };

// ── test scenarios ─────────────────────────────────────────────────────────────
const scenarios = [
  {
    name: 'Minimal — 1 range input, 1 output',
    cfg: {
      title: 'Security ROI', productName: 'Shield', description: 'Test.',
      brand: BASE_BRAND,
      inputs: [RANGE_INPUT],
      outputs: [SIMPLE_OUTPUT],
      cta: BASE_CTA,
    },
    expect: { visibleInputs: 1, rangeInputs: 1, numberInputs: 0, outputs: 1 },
  },
  {
    name: 'Number input only — 1 number input (no range slider), 1 output',
    cfg: {
      title: 'Security ROI', productName: 'Shield', description: 'Test.',
      brand: BASE_BRAND,
      inputs: [NUMBER_INPUT],
      outputs: [SIMPLE_OUTPUT],
      cta: BASE_CTA,
    },
    expect: { visibleInputs: 1, rangeInputs: 0, numberInputs: 1, outputs: 1 },
  },
  {
    name: 'Both input types visible — range + number',
    cfg: {
      title: 'Security ROI', productName: 'Shield', description: 'Test.',
      brand: BASE_BRAND,
      inputs: [RANGE_INPUT, NUMBER_INPUT, HIDDEN_INPUT],
      outputs: [SIMPLE_OUTPUT, CURRENCY_OUTPUT],
      cta: BASE_CTA,
    },
    expect: { visibleInputs: 2, rangeInputs: 1, numberInputs: 1, outputs: 2 },
  },
  {
    name: 'All inputs hidden — 0 visible inputs, outputs still render',
    cfg: {
      title: 'Security ROI', productName: 'Shield', description: 'Test.',
      brand: BASE_BRAND,
      inputs: [
        { ...RANGE_INPUT, visible: false },
        { ...NUMBER_INPUT, visible: false },
        HIDDEN_INPUT,
      ],
      outputs: [
        { id: 'fixed', label: 'Fixed Exposure Estimate', formula: '500000', format: 'currency', highlight: true },
      ],
      cta: BASE_CTA,
    },
    expect: { visibleInputs: 0, rangeInputs: 0, numberInputs: 0, outputs: 1 },
  },
  {
    name: 'Many outputs — 4 outputs, mixed formats, highlighted output',
    cfg: {
      title: 'Security ROI', productName: 'AcmeSec', description: 'Test.',
      brand: BASE_BRAND,
      inputs: [RANGE_INPUT, NUMBER_INPUT, HIDDEN_ESCALATION, HIDDEN_INPUT],
      outputs: [
        SIMPLE_OUTPUT,
        CURRENCY_OUTPUT,
        PRODUCT_OUTPUT,
        PERCENT_OUTPUT,
      ],
      cta: BASE_CTA,
    },
    expect: { visibleInputs: 2, rangeInputs: 1, numberInputs: 1, outputs: 4 },
  },
  {
    name: '{productName} substitution in output labels',
    cfg: {
      title: 'ROI Test', productName: 'CyberGuard', description: 'Test.',
      brand: BASE_BRAND,
      inputs: [RANGE_INPUT, NUMBER_INPUT],
      outputs: [PRODUCT_OUTPUT],
      cta: BASE_CTA,
    },
    // verified by label content check below
    expect: { visibleInputs: 2, outputs: 1 },
    checkProductName: 'CyberGuard',
  },
  {
    name: 'currency_k format — output uses abbreviated format',
    cfg: {
      title: 'ROI Test', productName: 'Shield', description: 'Test.',
      brand: BASE_BRAND,
      inputs: [RANGE_INPUT, NUMBER_INPUT],
      outputs: [
        { id: 'exp_k', label: 'Exposure (abbreviated)', formula: 'employees * avg_salary * 0.05', format: 'currency_k', highlight: false },
      ],
      cta: BASE_CTA,
    },
    expect: { visibleInputs: 2, outputs: 1 },
    checkKFormat: true,
  },
  {
    name: 'Slider interaction updates outputs',
    cfg: {
      title: 'ROI Test', productName: 'Shield', description: 'Test.',
      brand: BASE_BRAND,
      inputs: [RANGE_INPUT, NUMBER_INPUT],
      outputs: [SIMPLE_OUTPUT, CURRENCY_OUTPUT],
      cta: BASE_CTA,
    },
    expect: { visibleInputs: 2, outputs: 2 },
    checkInteraction: true,
  },
];

// ── run ────────────────────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless: true });

for (const scenario of scenarios) {
  console.log(`\n── ${scenario.name} ──`);

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.setContent(makeHtml(scenario.cfg), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Card renders
  const card = await page.$('.rc-card');
  card ? pass(`${scenario.name} — .rc-card rendered`) : fail(`${scenario.name} — .rc-card NOT rendered`);
  if (!card) { await page.close(); continue; }

  // Input counts
  const { expect: exp } = scenario;
  if (exp.visibleInputs !== undefined) {
    const fields = await page.$$('.rc-field');
    fields.length === exp.visibleInputs
      ? pass(`${scenario.name} — ${fields.length} visible input field(s)`)
      : fail(`${scenario.name} — expected ${exp.visibleInputs} visible inputs, got ${fields.length}`);
  }
  if (exp.rangeInputs !== undefined) {
    const ranges = await page.$$('input[type=range]');
    ranges.length === exp.rangeInputs
      ? pass(`${scenario.name} — ${ranges.length} range slider(s)`)
      : fail(`${scenario.name} — expected ${exp.rangeInputs} range inputs, got ${ranges.length}`);
  }
  if (exp.numberInputs !== undefined) {
    const nums = await page.$$('.rc-wrap input[type=number]');
    nums.length === exp.numberInputs
      ? pass(`${scenario.name} — ${nums.length} number input(s)`)
      : fail(`${scenario.name} — expected ${exp.numberInputs} number inputs, got ${nums.length}`);
  }

  // Output counts and values
  const outVals = await page.$$eval('.rc-out-val', els => els.map(e => e.textContent.trim()));
  if (exp.outputs !== undefined) {
    outVals.length === exp.outputs
      ? pass(`${scenario.name} — ${outVals.length} output(s) rendered`)
      : fail(`${scenario.name} — expected ${exp.outputs} outputs, got ${outVals.length}`);
  }
  const hasNaN = outVals.some(v => v.includes('NaN'));
  !hasNaN && outVals.length > 0
    ? pass(`${scenario.name} — output values valid`, outVals.join(' | '))
    : fail(`${scenario.name} — output values invalid`, outVals.join(' | '));

  // {productName} substitution
  if (scenario.checkProductName) {
    const labels = await page.$$eval('.rc-out-lbl', els => els.map(e => e.textContent.trim()));
    const subbed = labels.some(l => l.includes(scenario.checkProductName));
    const raw = labels.some(l => l.includes('{productName}'));
    subbed && !raw
      ? pass(`${scenario.name} — {productName} substituted with "${scenario.checkProductName}"`)
      : fail(`${scenario.name} — {productName} NOT substituted`, labels.join(' | '));
  }

  // currency_k format — should produce $K or $M
  if (scenario.checkKFormat) {
    const hasAbbrev = outVals.some(v => v.includes('K') || v.includes('M'));
    hasAbbrev
      ? pass(`${scenario.name} — currency_k output uses abbreviated form`, outVals.join(' | '))
      : fail(`${scenario.name} — currency_k output not abbreviated`, outVals.join(' | '));
  }

  // Slider interaction
  if (scenario.checkInteraction) {
    const rval = await page.$('.rc-rval');
    if (rval) {
      const before = [...outVals];
      await rval.click({ clickCount: 3 });
      await rval.fill('50000');
      await rval.dispatchEvent('input');
      await page.waitForTimeout(400);
      const after = await page.$$eval('.rc-out-val', els => els.map(e => e.textContent.trim()));
      JSON.stringify(before) !== JSON.stringify(after)
        ? pass(`${scenario.name} — slider interaction updates outputs`, `${before[1]} → ${after[1]}`)
        : fail(`${scenario.name} — outputs did not change after slider interaction`);
    }
  }

  // No console errors
  consoleErrors.length === 0
    ? pass(`${scenario.name} — no console errors`)
    : fail(`${scenario.name} — console errors`, consoleErrors.join(' | '));

  await page.close();
}

await browser.close();

// ── report ─────────────────────────────────────────────────────────────────────
console.log('\n## Embed Config Verification\n');
for (const r of results) console.log(`${r.s} ${r.label}${r.note ? ' — ' + r.note : ''}`);
const failed = results.filter(r => r.s === '❌').length;
console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${results.length} checks, ${failed} failed`);
