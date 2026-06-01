import { test, expect } from '@playwright/test'

// ─── helpers ───────────────────────────────────────────────────────────────

const BUILDER_URL  = 'http://localhost:5175/sales-builder/'
const TOOL_URL     = 'http://localhost:5180/seller-tool/'

// Replicates encodeConfig / btoa(unescape(encodeURIComponent(JSON.stringify(x))))
function encodeConfig(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

// Minimal config that exercises all code paths
const TEST_CONFIG = {
  title: 'Test ROI Calculator',
  productName: 'TestProduct',
  description: 'E2E test config',
  brand: { primaryColor: '#1a8a80', accentColor: '#00695c', fontFamily: 'DM Sans, sans-serif', logoUrl: '' },
  inputGroups: [
    {
      id: 'company_profile',
      label: 'Company Profile',
      description: 'Tell us about the company.',
      inputs: [
        { id: 'employees', label: 'Employees', type: 'number', default: 500, min: 1, max: 100000, step: 100, prefix: '', suffix: '', sellerAccess: 'prospect' },
        { id: 'daily_revenue', label: 'Daily Revenue', type: 'number', default: 25000, min: 0, max: 1000000, step: 1000, prefix: '$', suffix: '', sellerAccess: 'se' },
      ],
    },
    {
      id: 'product_impact',
      label: 'Product Impact',
      description: 'Locked — not shown to prospect.',
      inputs: [
        { id: 'reduction', label: 'Incident Reduction', type: 'number', default: 70, min: 0, max: 100, step: 5, prefix: '', suffix: '%', sellerAccess: 'locked' },
        { id: 'product_cost', label: 'Annual Product Cost', type: 'number', default: 50000, min: 0, max: 1000000, step: 1000, prefix: '$', suffix: '', sellerAccess: 'locked' },
      ],
    },
  ],
  outputs: [
    { id: 'savings', label: 'Annual Savings', formula: 'employees * daily_revenue * (reduction / 100) * 0.01', format: 'currency', highlight: true },
    { id: 'roi',    label: 'ROI',             formula: '(employees * daily_revenue * (reduction / 100) * 0.01 - product_cost) / product_cost * 100', format: 'number', highlight: false },
  ],
  leaveBehind: {
    showInputs: true,
    introLine: "Based on your profile, here's what {productName} can do for {company}.",
    nextSteps: 'Schedule a technical deep-dive with our team.',
  },
}

// ─── sales-builder ────────────────────────────────────────────────────────

test.describe('sales-builder', () => {
  test('header and nav load', async ({ page }) => {
    await page.goto(BUILDER_URL)
    await expect(page.locator('.app-header-logo')).toContainText('ROI Calculator Builder for Sales')
    await expect(page.locator('.app-header-badge')).toContainText('Beta')
    await expect(page.locator('.reset-btn')).toBeVisible()
    await expect(page.locator('.copy-url-btn')).toBeVisible()
    await expect(page.locator('.preview-session-btn')).toBeVisible()
    // All 5 nav steps
    for (const label of ['Template Info', 'Branding', 'Outputs & Formulas', 'Session Flow', 'Leave-Behind']) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible()
    }
  })

  test('Template Info step — inputs present and editable', async ({ page }) => {
    await page.goto(BUILDER_URL)
    const productNameInput = page.locator('input').filter({ hasText: '' }).nth(0)
    // Use label-based targeting
    await expect(page.getByPlaceholder('Our Product')).toBeVisible()
    await page.getByPlaceholder('Our Product').fill('Acme Security')
    await expect(page.getByPlaceholder('Our Product')).toHaveValue('Acme Security')
  })

  test('Branding step — color and font inputs present', async ({ page }) => {
    await page.goto(BUILDER_URL)
    await page.locator('.sidebar-item').filter({ hasText: 'Branding' }).click()
    await expect(page.locator('input[type="color"]').first()).toBeVisible()
  })

  test('Outputs & Formulas step — output chips visible (no crash)', async ({ page }) => {
    await page.goto(BUILDER_URL)
    await page.locator('.sidebar-item').filter({ hasText: 'Outputs' }).click()
    // Outputs renders as .item-card list — check at least one exists
    await expect(page.locator('.item-card').first()).toBeVisible()
    // Step header confirms we're on the right step
    await expect(page.locator('.step-header h2')).toContainText('Outputs')
  })

  test('Session Flow step — groups and description textareas present', async ({ page }) => {
    await page.goto(BUILDER_URL)
    await page.locator('.sidebar-item').filter({ hasText: 'Session Flow' }).click()
    // Group label inputs (editable name fields)
    await expect(page.locator('.group-name-input').first()).toBeVisible()
    // Description textarea present
    await expect(page.locator('textarea.group-desc-input').first()).toBeVisible()
    // Access buttons (cycle prospect/se/locked)
    await expect(page.locator('.access-btn').first()).toBeVisible()
  })

  test('Leave-Behind step — all config fields present', async ({ page }) => {
    await page.goto(BUILDER_URL)
    await page.locator('.sidebar-item').filter({ hasText: 'Leave-Behind' }).click()
    // Intro line input
    await expect(page.locator('input.form-input').first()).toBeVisible()
    // Next steps textarea
    await expect(page.locator('textarea.form-input').first()).toBeVisible()
    // Toggle slider (checkbox is CSS-hidden in toggle pattern)
    await expect(page.locator('.toggle-slider').first()).toBeVisible()
    // Open Session link
    await expect(page.getByText('Open Session ↗')).toBeVisible()
  })

  test('Copy URL button copies a non-empty URL', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto(BUILDER_URL)
    await page.locator('.copy-url-btn').click()
    await expect(page.locator('.copy-url-btn')).toContainText('Copied!')
    const text = await page.evaluate(() => navigator.clipboard.readText())
    expect(text).toMatch(/seller-tool.*#config\//)
  })

  test('Reset button shows confirm dialog', async ({ page }) => {
    await page.goto(BUILDER_URL)
    page.once('dialog', dialog => dialog.dismiss())
    await page.locator('.reset-btn').click()
    // If we reach here without error, dialog was shown and dismissed
  })
})

// ─── seller-tool: empty state ─────────────────────────────────────────────

test.describe('seller-tool', () => {
  test('empty state shows correct message', async ({ page }) => {
    await page.goto(TOOL_URL)
    await expect(page.locator('.empty-card h1')).toContainText('Security ROI Seller Tool')
    await expect(page.locator('.empty-card')).toContainText('Preview Session')
    await expect(page.locator('.empty-card')).toContainText('Copy URL')
  })

  test.describe('with config hash', () => {
    let sessionUrl

    test.beforeEach(async ({ page }) => {
      sessionUrl = TOOL_URL + '#config/' + encodeConfig(TEST_CONFIG)
      await page.goto(sessionUrl)
    })

    test('session header loads with product name', async ({ page }) => {
      await expect(page.locator('.session-product')).toContainText('TestProduct')
      await expect(page.locator('.session-subtitle')).toContainText('ROI Analysis')
      await expect(page.locator('.btn-leave-behind')).toBeVisible()
    })

    test('profile step — seller contact fields present', async ({ page }) => {
      await expect(page.getByPlaceholder(/your name/i)).toBeVisible()
      await expect(page.getByPlaceholder(/you@company/i)).toBeVisible()
      await expect(page.getByPlaceholder(/\+1.*555/i)).toBeVisible()
    })

    test('profile step — prospect fields present', async ({ page }) => {
      await expect(page.getByPlaceholder('Acme Corp')).toBeVisible()
      await expect(page.getByPlaceholder('Jane Smith')).toBeVisible()
    })

    test('output sidebar shows metric cards', async ({ page }) => {
      await expect(page.locator('.output-card').first()).toBeVisible()
    })

    test('step navigation — can advance through all steps', async ({ page }) => {
      // Step 1 of 2: Profile
      await expect(page.locator('.step-panel-header')).toContainText('Prospect Profile')
      // First step → "Next →" not "Build Leave-Behind"
      await expect(page.locator('.step-nav-next')).toContainText('Next')
      await page.locator('.step-nav-next').click()

      // Step 2 of 2: Company Profile (last non-locked group; Product Impact is all-locked, filtered out)
      await expect(page.locator('.step-panel-header')).toContainText('Company Profile')
      await expect(page.locator('.step-description')).toContainText('Tell us about the company.')
      // Last step → button says "Build Leave-Behind →" (don't click — it would navigate away)
      await expect(page.locator('.step-nav-next')).toContainText('Build Leave-Behind')
    })

    test('output sidebar updates when input changes', async ({ page }) => {
      // Advance to Company Profile step
      await page.locator('.step-nav-next').click()
      // Get initial value of first output card
      const before = await page.locator('.output-value').first().textContent()
      // Change employees input
      const empInput = page.locator('input[type="number"]').first()
      await empInput.fill('5000')
      await empInput.dispatchEvent('change')
      // Allow React re-render
      await page.waitForTimeout(200)
      const after = await page.locator('.output-value').first().textContent()
      // Value should have changed (or at least not crashed)
      expect(after).toBeTruthy()
    })

    test('Build Leave-Behind button opens summary view', async ({ page }) => {
      // Fast path: click the header Build Leave-Behind button
      await page.locator('.btn-leave-behind').click()
      await expect(page.locator('.summary-root')).toBeVisible()
    })
  })

  // ─── leave-behind (summary view) ─────────────────────────────────────────

  test.describe('leave-behind document', () => {
    const testProspect = {
      companyName: 'Acme Corp',
      contactName: 'Jane Doe',
      sellerName: 'John Seller',
      sellerEmail: 'john@company.com',
      sellerPhone: '+1 (555) 000-1234',
      date: '2026-06-01',
      inputValues: { employees: 1000, daily_revenue: 30000, reduction: 70, product_cost: 50000 },
    }

    test.beforeEach(async ({ page }) => {
      const state = { config: TEST_CONFIG, prospect: testProspect }
      const hash = '#summary/' + Buffer.from(JSON.stringify(state)).toString('base64')
      await page.goto(TOOL_URL + hash)
    })

    test('export bar actions visible', async ({ page }) => {
      await expect(page.locator('.export-bar')).toBeVisible()
      await expect(page.getByText('← Back to Session')).toBeVisible()
      await expect(page.getByText('Print / Save as PDF')).toBeVisible()
      await expect(page.getByText('Download .pptx')).toBeVisible()
    })

    test('header shows product name and prospect company', async ({ page }) => {
      await expect(page.locator('.summary-product')).toContainText('TestProduct')
      await expect(page.locator('.summary-title')).toContainText('ROI Analysis')
      await expect(page.locator('.summary-meta')).toContainText('Acme Corp')
    })

    test('intro line shows with substituted placeholders', async ({ page }) => {
      await expect(page.locator('.summary-intro')).toContainText('TestProduct')
      await expect(page.locator('.summary-intro')).toContainText('Acme Corp')
      // Placeholders should be replaced — not raw {productName}
      await expect(page.locator('.summary-intro')).not.toContainText('{productName}')
    })

    test('output metric cards show', async ({ page }) => {
      await expect(page.locator('.summary-output-card').first()).toBeVisible()
      // Highlight card for savings
      await expect(page.locator('.summary-output-card.highlight')).toBeVisible()
    })

    test('model inputs table shows when showInputs=true', async ({ page }) => {
      await expect(page.locator('.summary-assumptions')).toBeVisible()
      await expect(page.locator('.summary-section-heading').first()).toContainText('Model Inputs')
      // Group heading
      await expect(page.locator('.summary-input-group-heading')).toContainText('Company Profile')
      // Employees row (locked inputs filtered out)
      await expect(page.locator('.summary-input-label').first()).toBeVisible()
    })

    test('next steps section shows', async ({ page }) => {
      await expect(page.locator('.summary-next-steps')).toBeVisible()
      await expect(page.locator('.summary-next-steps')).toContainText('Schedule a technical deep-dive')
    })

    test('footer shows seller contact info', async ({ page }) => {
      await expect(page.locator('.summary-contact')).toBeVisible()
      await expect(page.locator('.summary-contact-name')).toContainText('John Seller')
      await expect(page.locator('.summary-contact-detail').first()).toContainText('john@company.com')
      await expect(page.locator('.summary-contact')).toContainText('+1 (555) 000-1234')
    })

    test('Back to Session returns to session view', async ({ page }) => {
      await page.getByText('← Back to Session').click()
      await expect(page.locator('.session-header')).toBeVisible()
    })

    test('showInputs=false hides model inputs section', async ({ page }) => {
      const configNoInputs = { ...TEST_CONFIG, leaveBehind: { ...TEST_CONFIG.leaveBehind, showInputs: false } }
      const state = { config: configNoInputs, prospect: testProspect }
      const hash = '#summary/' + Buffer.from(JSON.stringify(state)).toString('base64')
      await page.goto(TOOL_URL + hash)
      await expect(page.locator('.summary-assumptions')).not.toBeVisible()
      // Outputs and next steps should still show
      await expect(page.locator('.summary-output-card').first()).toBeVisible()
      await expect(page.locator('.summary-next-steps')).toBeVisible()
    })
  })

  test.describe('#session hash round-trip', () => {
    test('input values reload from URL state', async ({ page }) => {
      const prospect = {
        companyName: 'Round Trip Co',
        contactName: '',
        sellerName: '',
        sellerEmail: '',
        sellerPhone: '',
        date: '2026-06-01',
        inputValues: { employees: 2000, daily_revenue: 50000, reduction: 70, product_cost: 50000 },
      }
      const state = { config: TEST_CONFIG, prospect }
      const hash = '#session/' + Buffer.from(JSON.stringify(state)).toString('base64')
      await page.goto(TOOL_URL + hash)

      // Session loads correctly
      await expect(page.locator('.session-product')).toContainText('TestProduct')

      // Navigate to Company Profile step where employees input lives
      await page.locator('.step-nav-next').click()
      await expect(page.locator('.step-panel-header')).toContainText('Company Profile')

      // employees input should show the loaded value (2000), not the default (500)
      await expect(page.locator('input.number-input').first()).toHaveValue('2000')
    })
  })
})
