# Security ROI Calculator Builder

A no-code tool for cybersecurity marketers to build and embed interactive ROI calculators.

Configure inputs, formulas, and branding through a visual 5-step interface. Copy a single `<script>` tag to embed the result anywhere on your site. No server required.

**[Live demo →](https://stacyshelley.com/projects/roi-calculator/)**

---

## What it does

- **Builder app** — React + Vite UI for configuring a calculator: title, branding, input fields, output formulas, and a CTA button
- **Embeddable widget** — Standalone vanilla JS (`roi-widget.js`, no dependencies) that reads a base64-encoded config from a `data-config` attribute and renders a fully interactive calculator

The default template is built for cybersecurity products and models four cost areas:

- **Breach exposure** — 5 IBM-sourced factors (data exposure, downtime, IR, legal/notification, customer churn), probability-gated by an incident-to-breach escalation rate derived from annual incident volume
- **Incident management** — staff hours × fully-loaded cost per hour
- **Staff productivity loss** — headcount × FTE cost × impact factor
- **Compliance & regulatory risk** — direct audit costs + risk-adjusted fine exposure

Company size scaling is anchored at 10,000 employees (IBM's large-enterprise sample skew). The default template shows a before/after comparison driven by hidden marketer-set product impact inputs.

---

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, configure your calculator, and copy the embed code from the right panel.

## Building for production

```bash
npm run build
```

The `dist/` folder contains the builder app and `roi-widget.js`. Host them anywhere — GitHub Pages, Netlify, your own CDN.

If deploying under a subfolder (e.g. `/roi-calculator-app/`), set the base path in `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/roi-calculator-app/',
})
```

## Embedding the widget

The builder generates a script tag like this:

```html
<script
  data-roi-calc
  data-config="[base64-encoded-config]"
  src="https://your-domain.com/roi-widget.js">
</script>
```

Paste it anywhere on your page. The widget renders inline, scoped CSS included, and supports multiple instances per page.

---

## License

MIT © [Stacy Shelley](https://stacyshelley.com)
