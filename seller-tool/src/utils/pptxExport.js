import PptxGenJS from 'pptxgenjs'
import { evalFormula, formatValue } from './formulaEngine.js'

export function exportPptx({ config, prospect }) {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'

  const primary = config.brand?.primaryColor || '#1a8a80'
  const company = prospect.companyName || 'Prospect'
  const productName = config.productName || 'Our Product'
  const date = prospect.date || new Date().toISOString().slice(0, 10)

  // ── Slide 1: Title ──────────────────────────────────────────────────────────
  const s1 = pptx.addSlide()
  s1.background = { color: primary.replace('#', '') }

  s1.addText(productName, {
    x: 0.8, y: 1.4, w: 11.6, h: 0.7,
    fontSize: 20, bold: false, color: 'FFFFFF', fontFace: 'DM Sans',
    align: 'center', transparency: 30,
  })
  s1.addText('ROI Analysis', {
    x: 0.8, y: 2.0, w: 11.6, h: 1.2,
    fontSize: 48, bold: true, color: 'FFFFFF', fontFace: 'DM Sans',
    align: 'center',
  })
  s1.addText(`Prepared for ${company}`, {
    x: 0.8, y: 3.6, w: 11.6, h: 0.5,
    fontSize: 18, bold: false, color: 'FFFFFF', fontFace: 'DM Sans',
    align: 'center', transparency: 20,
  })
  s1.addText(date, {
    x: 0.8, y: 4.2, w: 11.6, h: 0.4,
    fontSize: 13, bold: false, color: 'FFFFFF', fontFace: 'DM Sans',
    align: 'center', transparency: 40,
  })

  // ── Slide 2: Results ────────────────────────────────────────────────────────
  const s2 = pptx.addSlide()
  s2.background = { color: 'F5F8F7' }

  s2.addText(`${productName} ROI — ${company}`, {
    x: 0.5, y: 0.3, w: 12.3, h: 0.5,
    fontSize: 14, bold: false, color: '6b7280', fontFace: 'DM Sans',
  })
  s2.addText('Quantified Risk Analysis', {
    x: 0.5, y: 0.7, w: 12.3, h: 0.6,
    fontSize: 26, bold: true, color: '0d1117', fontFace: 'DM Sans',
  })

  // Compute output values
  const inputMap = {}
  for (const inp of config.inputs || []) {
    inputMap[inp.id] = prospect.inputValues?.[inp.id] ?? inp.default ?? 0
  }

  const outputs = config.outputs || []
  const cols = Math.min(outputs.length, 3)
  const cardW = cols > 0 ? (12.3 - (cols - 1) * 0.25) / cols : 4
  const cardH = 1.6

  outputs.forEach((out, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = 0.5 + col * (cardW + 0.25)
    const y = 1.7 + row * (cardH + 0.2)
    const val = evalFormula(out.formula, inputMap)
    const formatted = formatValue(val, out.format)
    const label = (out.label || '').replace(/\{productName\}/g, productName)
    const isHighlight = !!out.highlight

    s2.addShape(pptx.ShapeType.rect, {
      x, y, w: cardW, h: cardH,
      fill: { color: isHighlight ? primary.replace('#', '') : 'FFFFFF' },
      line: { color: isHighlight ? primary.replace('#', '') : 'CCDEDA', width: 1 },
    })
    s2.addText(formatted, {
      x: x + 0.18, y: y + 0.22, w: cardW - 0.36, h: 0.7,
      fontSize: 32, bold: true,
      color: isHighlight ? 'FFFFFF' : '0d1117',
      fontFace: 'DM Sans',
    })
    s2.addText(label, {
      x: x + 0.18, y: y + 0.95, w: cardW - 0.36, h: 0.5,
      fontSize: 11, bold: false,
      color: isHighlight ? 'FFFFFF' : '6b7280',
      fontFace: 'DM Sans',
    })
  })

  // Footer
  const footerY = 6.8
  s2.addText(`Prepared by ${prospect.sellerName || productName} · ${date}`, {
    x: 0.5, y: footerY, w: 8, h: 0.3,
    fontSize: 9, color: '9ca3af', fontFace: 'DM Sans',
  })
  if (config.cta?.text) {
    s2.addText(config.cta.text + ' →', {
      x: 9.5, y: footerY, w: 3.3, h: 0.3,
      fontSize: 10, bold: true, color: primary.replace('#', ''), fontFace: 'DM Sans',
      align: 'right',
    })
  }

  const filename = `${company.replace(/[^a-z0-9]/gi, '-') || 'prospect'}-roi-analysis.pptx`
  pptx.writeFile({ fileName: filename })
}
