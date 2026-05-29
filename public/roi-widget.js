/* ROI Calculator Widget — standalone, no dependencies, ~10KB */
(function () {
  'use strict';

  function decodeConfig(b64) {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(b64))));
    } catch (e) {
      console.error('[ROI Widget] Invalid config:', e);
      return null;
    }
  }

  function formatValue(value, format) {
    var n = typeof value === 'number' && isFinite(value) ? value : 0;
    switch (format) {
      case 'currency':
        return '$' + Math.round(n).toLocaleString();
      case 'currency_k':
        return n >= 1000000
          ? '$' + (n / 1000000).toFixed(1) + 'M'
          : n >= 1000
          ? '$' + (n / 1000).toFixed(0) + 'K'
          : '$' + Math.round(n).toLocaleString();
      case 'percent':
        return (Math.round(n * 10) / 10).toLocaleString() + '%';
      case 'number':
        return Math.round(n).toLocaleString();
      case 'number_1dp':
        return (Math.round(n * 10) / 10).toLocaleString();
      case 'months':
        var m = Math.round(n);
        return m + (m === 1 ? ' month' : ' months');
      case 'hours':
        var h = Math.round(n);
        return h.toLocaleString() + (h === 1 ? ' hour' : ' hours');
      case 'days':
        var d = Math.round(n);
        return d.toLocaleString() + (d === 1 ? ' day' : ' days');
      default:
        return (Math.round(n * 100) / 100).toLocaleString();
    }
  }

  function evalFormula(formula, vars) {
    try {
      var keys = Object.keys(vars);
      var vals = keys.map(function (k) { return vars[k]; });
      // eslint-disable-next-line no-new-func
      var fn = Function.apply(null, keys.concat(['"use strict"; return (' + formula + ');']));
      var result = fn.apply(null, vals);
      return typeof result === 'number' && isFinite(result) ? result : 0;
    } catch (_) {
      return 0;
    }
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function numDisplay(n) {
    return Number(n).toLocaleString();
  }

  var widgetCount = 0;

  function createWidget(config, container) {
    widgetCount++;
    var uid = 'roiw' + widgetCount;
    var brand = config.brand || {};
    var primary = brand.primaryColor || '#2563eb';
    var accent = brand.accentColor || '#16a34a';
    var font = brand.fontFamily || 'Inter, system-ui, -apple-system, sans-serif';

    /* ── styles ── */
    var css = [
      '#' + uid + '{font-family:' + font + ';box-sizing:border-box}',
      '#' + uid + ' *,#' + uid + ' *::before,#' + uid + ' *::after{box-sizing:inherit}',
      '#' + uid + ' .rc-card{background:#fff;border-radius:12px;box-shadow:0 4px 32px rgba(0,0,0,.1);padding:32px;max-width:680px;margin:0 auto}',
      '#' + uid + ' .rc-logo{max-height:40px;margin-bottom:16px;display:block}',
      '#' + uid + ' .rc-title{font-size:1.4rem;font-weight:700;color:#111;margin:0 0 4px}',
      '#' + uid + ' .rc-desc{font-size:.9rem;color:#555;margin:0 0 24px}',
      '#' + uid + ' .rc-inputs{display:grid;gap:16px;margin-bottom:28px}',
      '#' + uid + ' .rc-field label{display:block;font-size:.85rem;font-weight:600;color:#374151;margin-bottom:6px}',
      '#' + uid + ' .rc-wrap{display:flex;align-items:center;border:1.5px solid #d1d5db;border-radius:8px;overflow:hidden;background:#f9fafb;transition:border-color .15s}',
      '#' + uid + ' .rc-wrap:focus-within{border-color:' + primary + ';background:#fff;box-shadow:0 0 0 3px ' + primary + '22}',
      '#' + uid + ' .rc-affix{padding:0 10px;color:#6b7280;font-size:.9rem;white-space:nowrap;pointer-events:none}',
      '#' + uid + ' .rc-wrap input[type=number]{flex:1;border:none;padding:10px 8px;font-size:1rem;background:transparent;outline:none;color:#111;width:0}',
      '#' + uid + ' .rc-wrap input[type=range]{flex:1;margin:0 8px;padding:8px 0;accent-color:' + primary + ';cursor:pointer;background:transparent;border:none;outline:none}',
      '#' + uid + ' .rc-rval{min-width:64px;text-align:right;padding-right:12px;font-weight:700;color:' + primary + ';font-size:.9rem;white-space:nowrap}',
      '#' + uid + ' .rc-outputs{display:grid;gap:12px;margin-bottom:24px}',
      '#' + uid + ' .rc-out{background:#f3f4f6;border-radius:8px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:12px}',
      '#' + uid + ' .rc-out.hl{background:' + primary + '0f;border:1.5px solid ' + primary + '33}',
      '#' + uid + ' .rc-out-lbl{font-size:.9rem;color:#4b5563;font-weight:500}',
      '#' + uid + ' .rc-out-val{font-size:1.4rem;font-weight:800;color:' + primary + ';white-space:nowrap}',
      '#' + uid + ' .rc-out.hl .rc-out-val{color:' + accent + ';font-size:1.7rem}',
      '#' + uid + ' .rc-cta{display:block;width:100%;padding:14px 24px;background:' + primary + ';color:#fff;text-align:center;text-decoration:none;border-radius:8px;font-size:1rem;font-weight:700;border:none;cursor:pointer;transition:opacity .15s;letter-spacing:.01em}',
      '#' + uid + ' .rc-cta:hover{opacity:.87}',
    ].join('\n');

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* ── state ── */
    var state = {};
    (config.inputs || []).forEach(function (inp) {
      state[inp.id] = Number(inp.default != null ? inp.default : 0);
    });

    /* ── helpers ── */
    function compute() {
      var r = {};
      (config.outputs || []).forEach(function (out) {
        r[out.id] = evalFormula(out.formula || '0', state);
      });
      return r;
    }

    function updateOutputs() {
      var vals = compute();
      (config.outputs || []).forEach(function (out) {
        var el = root.querySelector('[data-oid="' + out.id + '"]');
        if (el) el.textContent = formatValue(vals[out.id], out.format);
      });
    }

    /* ── build DOM ── */
    var root = document.createElement('div');
    root.id = uid;

    var card = document.createElement('div');
    card.className = 'rc-card';
    root.appendChild(card);

    if (brand.logoUrl) {
      var logo = document.createElement('img');
      logo.className = 'rc-logo';
      logo.src = brand.logoUrl;
      logo.alt = '';
      card.appendChild(logo);
    }

    if (config.title) {
      var title = document.createElement('div');
      title.className = 'rc-title';
      title.textContent = config.title;
      card.appendChild(title);
    }

    if (config.description) {
      var desc = document.createElement('div');
      desc.className = 'rc-desc';
      desc.textContent = config.description;
      card.appendChild(desc);
    }

    /* inputs */
    if ((config.inputs || []).length) {
      var inputsDiv = document.createElement('div');
      inputsDiv.className = 'rc-inputs';
      card.appendChild(inputsDiv);

      (config.inputs || []).forEach(function (inp) {
        if (inp.visible === false) return;
        var field = document.createElement('div');
        field.className = 'rc-field';

        var lbl = document.createElement('label');
        lbl.htmlFor = uid + '_' + inp.id;
        lbl.textContent = inp.label;
        field.appendChild(lbl);

        var wrap = document.createElement('div');
        wrap.className = 'rc-wrap';
        field.appendChild(wrap);

        var isRange = inp.type === 'range';

        if (inp.prefix) {
          var pre = document.createElement('span');
          pre.className = 'rc-affix';
          pre.textContent = inp.prefix;
          wrap.appendChild(pre);
        }

        var input = document.createElement('input');
        input.id = uid + '_' + inp.id;
        input.type = isRange ? 'range' : 'number';
        input.dataset.id = inp.id;
        input.min = inp.min != null ? inp.min : 0;
        if (inp.max != null) input.max = inp.max;
        input.step = inp.step != null ? inp.step : 1;
        input.value = state[inp.id];
        wrap.appendChild(input);

        if (isRange) {
          var rval = document.createElement('span');
          rval.className = 'rc-rval';
          rval.dataset.rid = inp.id;
          rval.textContent = numDisplay(state[inp.id]);
          wrap.appendChild(rval);
        } else if (inp.suffix) {
          var suf = document.createElement('span');
          suf.className = 'rc-affix';
          suf.textContent = inp.suffix;
          wrap.appendChild(suf);
        }

        input.addEventListener('input', function () {
          state[inp.id] = parseFloat(this.value) || 0;
          if (isRange) {
            var rv = root.querySelector('[data-rid="' + inp.id + '"]');
            if (rv) rv.textContent = numDisplay(state[inp.id]);
          }
          updateOutputs();
        });

        inputsDiv.appendChild(field);
      });
    }

    /* outputs */
    if ((config.outputs || []).length) {
      var outputsDiv = document.createElement('div');
      outputsDiv.className = 'rc-outputs';
      card.appendChild(outputsDiv);

      var initialVals = compute();
      (config.outputs || []).forEach(function (out) {
        var row = document.createElement('div');
        row.className = 'rc-out' + (out.highlight ? ' hl' : '');

        var lblEl = document.createElement('span');
        lblEl.className = 'rc-out-lbl';
        lblEl.textContent = (out.label || '').replace(/\{productName\}/g, config.productName || 'Product');
        row.appendChild(lblEl);

        var valEl = document.createElement('span');
        valEl.className = 'rc-out-val';
        valEl.dataset.oid = out.id;
        valEl.textContent = formatValue(initialVals[out.id], out.format);
        row.appendChild(valEl);

        outputsDiv.appendChild(row);
      });
    }

    /* CTA */
    if (config.cta && config.cta.text) {
      var cta = document.createElement('a');
      cta.className = 'rc-cta';
      cta.href = config.cta.url || '#';
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.textContent = config.cta.text;
      card.appendChild(cta);
    }

    container.appendChild(root);
  }

  function init() {
    var scripts = document.querySelectorAll('script[data-roi-calc]');
    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      var b64 = script.getAttribute('data-config');
      if (!b64) continue;
      var config = decodeConfig(b64);
      if (!config) continue;
      var host = document.createElement('div');
      script.parentNode.insertBefore(host, script.nextSibling);
      createWidget(config, host);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
