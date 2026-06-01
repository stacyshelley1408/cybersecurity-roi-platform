import PptxGenJS from 'pptxgenjs'
import { evalFormula, formatValue } from '@core/formulaEngine'
import { getFlatInputs } from '@core/utils'

const FONT = 'DM Sans'
const BG_LIGHT = 'F8F9FA'
const BORDER = 'E5E7EB'
const TEXT_DARK = '111827'
const TEXT_MID = '6B7280'
const TEXT_LIGHT = '9CA3AF'
const ROW_ALT = 'FAFAFA'

const hex = c => (c || '#1a8a80').replace('#', '')

function pageHeader(slide, primary, label) {
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.07, fill: { color: hex(primary) }, line: { color: hex(primary) } })
  if (label) {
    slide.addText(label, {
      x: 0.5, y: 0.15, w: 12.3, h: 0.32,
      fontSize: 9, color: TEXT_LIGHT, fontFace: FONT,
    })
  }
}

function pageFooter(slide, prospect) {
  const date = prospect.date || new Date().toISOString().slice(0, 10)
  const contactParts = [prospect.sellerName, prospect.sellerEmail, prospect.sellerPhone].filter(Boolean)
  slide.addShape('rect', { x: 0, y: 7.18, w: 13.33, h: 0.32, fill: { color: 'F3F4F6' }, line: { color: BORDER, width: 0.5 } })
  if (contactParts.length) {
    slide.addText(contactParts.join('  ·  '), {
      x: 0.4, y: 7.2, w: 9, h: 0.28,
      fontSize: 8, color: TEXT_LIGHT, fontFace: FONT, valign: 'middle',
    })
  }
  slide.addText(date, {
    x: 9.5, y: 7.2, w: 3.4, h: 0.28,
    fontSize: 8, color: TEXT_LIGHT, fontFace: FONT, align: 'right', valign: 'middle',
  })
}

export function exportPptx({ config, prospect }) {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE' // 13.33" × 7.5"

  const primary = config.brand?.primaryColor || '#1a8a80'
  const company = prospect.companyName || 'Prospect'
  const productName = config.productName || 'Our Product'
  const date = prospect.date || new Date().toISOString().slice(0, 10)
  const lb = config.leaveBehind || {}

  const inputMap = {}
  for (const inp of getFlatInputs(config)) {
    inputMap[inp.id] = prospect.inputValues?.[inp.id] ?? inp.default ?? 0
  }

  // ── Slide 1: Title ──────────────────────────────────────────────────────────
  const s1 = pptx.addSlide()
  s1.background = { color: hex(primary) }

  // Subtle bottom strip
  s1.addShape('rect', { x: 0, y: 6.9, w: 13.33, h: 0.6, fill: { color: 'FFFFFF', transparency: 88 }, line: { color: 'FFFFFF', transparency: 88 } })
  // Left accent rule
  s1.addShape('rect', { x: 0.65, y: 1.7, w: 0.06, h: 2.6, fill: { color: 'FFFFFF', transparency: 35 }, line: { color: 'FFFFFF', transparency: 35 } })

  s1.addText(productName, {
    x: 0.85, y: 1.7, w: 9, h: 0.52,
    fontSize: 15, color: 'FFFFFF', fontFace: FONT, transparency: 25,
  })
  s1.addText('ROI Analysis', {
    x: 0.85, y: 2.25, w: 10, h: 1.1,
    fontSize: 50, bold: true, color: 'FFFFFF', fontFace: FONT,
  })
  s1.addText(`Prepared for ${company}`, {
    x: 0.85, y: 3.5, w: 9, h: 0.5,
    fontSize: 20, color: 'FFFFFF', fontFace: FONT, transparency: 15,
  })

  const footerParts = [
    prospect.sellerName,
    prospect.sellerPhone,
    prospect.sellerEmail,
  ].filter(Boolean)
  if (footerParts.length) {
    s1.addText(footerParts.join('  ·  '), {
      x: 0.65, y: 6.97, w: 8, h: 0.28,
      fontSize: 9, color: 'FFFFFF', fontFace: FONT, transparency: 40,
    })
  }
  s1.addText(date, {
    x: 9.5, y: 6.97, w: 3.5, h: 0.28,
    fontSize: 9, color: 'FFFFFF', fontFace: FONT, align: 'right', transparency: 40,
  })

  // ── Slide 2: Results ────────────────────────────────────────────────────────
  const s2 = pptx.addSlide()
  s2.background = { color: BG_LIGHT }
  pageHeader(s2, primary, `${productName}  ·  ${company}  ·  ${date}`)

  const introLine = lb.introLine
    ? lb.introLine.replace(/\{productName\}/g, productName).replace(/\{company\}/g, company)
    : null

  s2.addText('Quantified Risk Analysis', {
    x: 0.5, y: 0.52, w: 12.3, h: 0.68,
    fontSize: 28, bold: true, color: TEXT_DARK, fontFace: FONT,
  })
  if (introLine) {
    s2.addText(introLine, {
      x: 0.5, y: 1.22, w: 12.3, h: 0.38,
      fontSize: 11, italic: true, color: TEXT_MID, fontFace: FONT,
    })
  }

  const outputs = config.outputs || []
  const regular = outputs.filter(o => !o.highlight)
  const highlighted = outputs.filter(o => o.highlight)
  const cardsY = introLine ? 1.7 : 1.5
  const gap = 0.2

  // Regular cards row(s)
  if (regular.length > 0) {
    const cols = Math.min(regular.length, 4)
    const cardW = (12.3 - (cols - 1) * gap) / cols
    const cardH = 1.55
    regular.forEach((out, i) => {
      const x = 0.5 + (i % cols) * (cardW + gap)
      const y = cardsY + Math.floor(i / cols) * (cardH + gap)
      const val = evalFormula(out.formula, inputMap)
      const label = (out.label || '').replace(/\{productName\}/g, productName)
      s2.addShape('rect', { x, y, w: cardW, h: cardH, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 1 } })
      s2.addText(formatValue(val, out.format), {
        x: x + 0.2, y: y + 0.18, w: cardW - 0.4, h: 0.75,
        fontSize: 26, bold: true, color: TEXT_DARK, fontFace: FONT,
      })
      s2.addText(label, {
        x: x + 0.2, y: y + 0.95, w: cardW - 0.4, h: 0.5,
        fontSize: 10, color: TEXT_MID, fontFace: FONT, wrap: true,
      })
    })
  }

  // Highlight card(s) — full-width row below
  if (highlighted.length > 0) {
    const regularRows = regular.length > 0 ? Math.ceil(regular.length / Math.min(regular.length, 4)) : 0
    const hlY = cardsY + regularRows * (1.55 + gap)
    const hlW = (12.3 - (highlighted.length - 1) * gap) / highlighted.length
    highlighted.forEach((out, i) => {
      const x = 0.5 + i * (hlW + gap)
      const val = evalFormula(out.formula, inputMap)
      const label = (out.label || '').replace(/\{productName\}/g, productName)
      s2.addShape('rect', { x, y: hlY, w: hlW, h: 1.65, fill: { color: hex(primary) }, line: { color: hex(primary) } })
      s2.addText(formatValue(val, out.format), {
        x: x + 0.25, y: hlY + 0.18, w: hlW - 0.5, h: 0.82,
        fontSize: 34, bold: true, color: 'FFFFFF', fontFace: FONT,
      })
      s2.addText(label, {
        x: x + 0.25, y: hlY + 1.02, w: hlW - 0.5, h: 0.45,
        fontSize: 11, color: 'FFFFFF', fontFace: FONT, transparency: 18,
      })
    })
  }

  pageFooter(s2, prospect)

  // ── Slide 3: Model Inputs ────────────────────────────────────────────────────
  if (lb.showInputs !== false) {
    const groups = (config.inputGroups || [])
      .map(g => ({ ...g, visible: g.inputs.filter(i => i.sellerAccess !== 'locked') }))
      .filter(g => g.visible.length > 0)

    if (groups.length > 0) {
      const s3 = pptx.addSlide()
      s3.background = { color: 'FFFFFF' }
      pageHeader(s3, primary, `${productName}  ·  ${company}`)
      s3.addText('Model Inputs', {
        x: 0.5, y: 0.52, w: 12.3, h: 0.6,
        fontSize: 26, bold: true, color: TEXT_DARK, fontFace: FONT,
      })

      const colW = 5.9
      const colGap = 0.53
      const rowH = 0.27
      const headH = 0.32
      let col = 0
      const colY = [1.25, 1.25]

      groups.forEach(group => {
        const x = 0.5 + col * (colW + colGap)
        let y = colY[col]

        // Group heading
        s3.addShape('rect', { x, y, w: colW, h: headH, fill: { color: 'F3F4F6' }, line: { color: BORDER, width: 0.75 } })
        s3.addText(group.label.toUpperCase(), {
          x: x + 0.12, y, w: colW - 0.24, h: headH,
          fontSize: 8, bold: true, color: TEXT_MID, fontFace: FONT, valign: 'middle',
        })
        y += headH

        // Input rows
        group.visible.forEach((inp, idx) => {
          const val = inputMap[inp.id] ?? inp.default ?? 0
          const display = inp.prefix
            ? `${inp.prefix}${Number(val).toLocaleString()}${inp.suffix || ''}`
            : `${Number(val).toLocaleString()}${inp.suffix || ''}`
          const bg = idx % 2 === 0 ? 'FFFFFF' : ROW_ALT
          s3.addShape('rect', { x, y, w: colW, h: rowH, fill: { color: bg }, line: { color: BORDER, width: 0.5 } })
          s3.addText(inp.label, {
            x: x + 0.12, y, w: colW * 0.62, h: rowH,
            fontSize: 9, color: TEXT_MID, fontFace: FONT, valign: 'middle',
          })
          s3.addText(display, {
            x: x + colW * 0.64, y, w: colW * 0.3, h: rowH,
            fontSize: 9, bold: true, color: TEXT_DARK, fontFace: FONT, align: 'right', valign: 'middle',
          })
          y += rowH
        })

        colY[col] = y + 0.18
        col = colY[0] <= colY[1] ? 0 : 1
      })

      pageFooter(s3, prospect)
    }
  }

  // ── Slide 4: Next Steps + Contact ────────────────────────────────────────────
  if (lb.nextSteps) {
    const s4 = pptx.addSlide()
    s4.background = { color: hex(primary) }

    s4.addShape('rect', { x: 0, y: 6.9, w: 13.33, h: 0.6, fill: { color: 'FFFFFF', transparency: 88 }, line: { color: 'FFFFFF', transparency: 88 } })

    s4.addText('Next Steps', {
      x: 0.85, y: 1.6, w: 10, h: 0.75,
      fontSize: 36, bold: true, color: 'FFFFFF', fontFace: FONT,
    })
    s4.addText(lb.nextSteps, {
      x: 0.85, y: 2.5, w: 10.5, h: 2,
      fontSize: 16, color: 'FFFFFF', fontFace: FONT, transparency: 12, wrap: true,
    })

    const contactParts = [prospect.sellerName, prospect.sellerEmail, prospect.sellerPhone].filter(Boolean)
    if (contactParts.length) {
      s4.addShape('rect', { x: 0.65, y: 5.4, w: 0.06, h: 0.9, fill: { color: 'FFFFFF', transparency: 30 }, line: { color: 'FFFFFF', transparency: 30 } })
      s4.addText(contactParts.join('\n'), {
        x: 0.85, y: 5.4, w: 8, h: 0.9,
        fontSize: 12, color: 'FFFFFF', fontFace: FONT, transparency: 20,
      })
    }

    s4.addText(date, {
      x: 9.5, y: 6.97, w: 3.5, h: 0.28,
      fontSize: 9, color: 'FFFFFF', fontFace: FONT, align: 'right', transparency: 40,
    })
  }

  const filename = `${company.replace(/[^a-z0-9]/gi, '-') || 'prospect'}-roi-analysis.pptx`
  pptx.writeFile({ fileName: filename })
}
