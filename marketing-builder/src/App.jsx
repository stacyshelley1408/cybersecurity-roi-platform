import { useState, useEffect } from 'react'
import { version } from '../package.json'
import './App.css'
import StepNav from '@core/components/StepNav'
import LivePreview from './components/LivePreview'
import EmbedCode from './components/EmbedCode'
import InfoStep from '@core/components/InfoStep'
import BrandingStep from '@core/components/BrandingStep'
import InputsStep from './components/steps/InputsStep'
import OutputsStep from '@core/components/OutputsStep'
import CtaStep from './components/steps/CtaStep'

export const DEFAULT_CONFIG = {
  title: 'Security ROI Calculator',
  productName: 'Our Product',
  description: 'Quantify your total cybersecurity risk exposure across breaches, incidents, downtime, and compliance. See how much your organization can save.',
  brand: {
    primaryColor: '#1a8a80',
    accentColor: '#00695c',
    fontFamily: 'DM Sans, system-ui, sans-serif',
    logoUrl: '',
  },
  inputs: [
    // ── Staffing ──
    { id: 'employees', label: 'Number of Employees', type: 'range', default: 500, min: 10, max: 100000, step: 100, prefix: '', suffix: '', visible: true },
    { id: 'avg_salary', label: 'Average FTE Cost', type: 'number', default: 124910, min: 1, max: 500000, step: 1000, prefix: '$', suffix: '', visible: true },
    // ── Incidents & escalation ──
    { id: 'hours_per_incident', label: 'Avg. Hours to Resolve Incident', type: 'range', default: 6, min: 1, max: 40, step: 1, prefix: '', suffix: '', visible: false },
    { id: 'escalation_rate', label: 'Incident-to-Breach Escalation Rate', type: 'number', default: 3, min: 0.1, max: 25, step: 0.5, prefix: '', suffix: '%', visible: false },
    // ── Breach cost factors ──
    { id: 'records_at_risk', label: 'Records / Accounts at Risk', type: 'number', default: 50000, min: 100, max: 100000000, step: 1000, prefix: '', suffix: '', visible: false },
    { id: 'cost_per_record', label: 'Cost per Record Exposed', type: 'number', default: 60, min: 1, max: 500, step: 5, prefix: '$', suffix: '', visible: false },
    { id: 'downtime_days', label: 'Expected Downtime (days)', type: 'range', default: 21, min: 1, max: 90, step: 1, prefix: '', suffix: '', visible: false },
    { id: 'daily_revenue', label: 'Daily Revenue', type: 'number', default: 25000, min: 0, max: 10000000, step: 1000, prefix: '$', suffix: '', visible: false },
    { id: 'ir_cost', label: 'Detection & Investigation Cost', type: 'number', default: 75000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'notification_legal_cost', label: 'Notification & Legal Cost', type: 'number', default: 50000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'customer_base', label: 'Total Customer Count', type: 'number', default: 2000, min: 0, max: 10000000, step: 100, prefix: '', suffix: '', visible: false },
    { id: 'post_breach_churn', label: 'Estimated Post-Breach Churn', type: 'number', default: 3, min: 0, max: 50, step: 1, prefix: '', suffix: '%', visible: false },
    { id: 'customer_ltv', label: 'Avg. Customer Lifetime Value', type: 'number', default: 15000, min: 0, max: 10000000, step: 500, prefix: '$', suffix: '', visible: false },
    // ── Compliance ──
    { id: 'annual_audit_cost', label: 'Annual Compliance & Audit Costs', type: 'number', default: 175000, min: 0, max: 5000000, step: 5000, prefix: '$', suffix: '', visible: false },
    { id: 'fine_exposure', label: 'Annual Regulatory Fine Exposure', type: 'number', default: 400000, min: 0, max: 50000000, step: 10000, prefix: '$', suffix: '', visible: false },
    // ── Product impact (marketer-set, hidden from widget end users) ──
    { id: 'incident_reduction', label: 'Incident Reduction', type: 'number', default: 70, min: 0, max: 100, step: 5, prefix: '', suffix: '%', visible: false },
    { id: 'escalation_reduction', label: 'Escalation Rate Reduction', type: 'number', default: 50, min: 0, max: 100, step: 5, prefix: '', suffix: '%', visible: false },
    { id: 'downtime_reduction', label: 'Downtime Reduction', type: 'number', default: 40, min: 0, max: 100, step: 5, prefix: '', suffix: '%', visible: false },
    { id: 'compliance_reduction', label: 'Compliance Cost Reduction', type: 'number', default: 20, min: 0, max: 100, step: 5, prefix: '', suffix: '%', visible: false },
    { id: 'product_cost', label: 'Annual Product Cost', type: 'number', default: 50000, min: 0, max: 10000000, step: 1000, prefix: '$', suffix: '', visible: false },
  ],
  outputs: [
    {
      id: 'security_incidents',
      label: 'Estimated Security Incidents / Year',
      formula: 'Math.round(Math.sqrt(employees * Math.min(employees, 500)) * 0.12)',
      format: 'number',
      highlight: false,
    },
    {
      id: 'security_breaches',
      label: 'Estimated Security Breaches / Year',
      formula: 'Math.sqrt(employees * Math.min(employees, 500)) * 0.12 * escalation_rate * Math.pow(1000 / Math.max(employees, 1000), 0.2) / 100',
      format: 'number_1dp',
      highlight: false,
    },
    {
      id: 'exposure_without',
      label: 'Current Annual Risk Exposure',
      formula: '((Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * escalation_rate * Math.pow(1000 / Math.max(employees, 1000), 0.2) / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + (Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * hours_per_incident * (avg_salary / 2080) + Math.pow(employees, 0.65) * avg_salary * 0.05 + annual_audit_cost + fine_exposure * 0.15',
      format: 'currency',
      highlight: false,
    },
    {
      id: 'exposure_with',
      label: 'Risk Exposure With {productName}',
      formula: '((Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * (1 - incident_reduction/100) * escalation_rate * Math.pow(1000 / Math.max(employees, 1000), 0.2) * (1 - escalation_reduction/100) / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * (1 - downtime_reduction/100) * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + (Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * (1 - incident_reduction/100) * hours_per_incident * (avg_salary / 2080) + Math.pow(employees, 0.65) * avg_salary * 0.05 + (annual_audit_cost + fine_exposure * 0.15) * (1 - compliance_reduction/100)',
      format: 'currency',
      highlight: false,
    },
    {
      id: 'risk_reduction',
      label: 'Quantified Risk Reduction',
      formula: '(((Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * escalation_rate * Math.pow(1000 / Math.max(employees, 1000), 0.2) / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + (Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * hours_per_incident * (avg_salary / 2080) + Math.pow(employees, 0.65) * avg_salary * 0.05 + annual_audit_cost + fine_exposure * 0.15) - (((Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * (1 - incident_reduction/100) * escalation_rate * Math.pow(1000 / Math.max(employees, 1000), 0.2) * (1 - escalation_reduction/100) / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * (1 - downtime_reduction/100) * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + (Math.sqrt(employees * Math.min(employees, 500)) * 0.12) * (1 - incident_reduction/100) * hours_per_incident * (avg_salary / 2080) + Math.pow(employees, 0.65) * avg_salary * 0.05 + (annual_audit_cost + fine_exposure * 0.15) * (1 - compliance_reduction/100))',
      format: 'currency',
      highlight: true,
    },
  ],
  cta: {
    text: 'Get Your Free Security Assessment',
    url: 'https://example.com/demo',
  },
}

const STEPS = [
  { id: 'info', label: 'Template Info' },
  { id: 'branding', label: 'Branding' },
  { id: 'inputs', label: 'Input Fields' },
  { id: 'outputs', label: 'Outputs & Formulas' },
  { id: 'cta', label: 'Call to Action' },
]

const LS_KEY = 'roi-calc-builder-config'

export default function App() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_CONFIG
  })
  const [step, setStep] = useState('info')
  const [rightTab, setRightTab] = useState('preview')

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(config)) } catch {}
  }, [config])

  function loadConfig(newConfig) {
    setConfig(newConfig)
  }

  function update(partial) {
    setConfig(c => ({ ...c, ...partial }))
  }

  function updateBrand(partial) {
    setConfig(c => ({ ...c, brand: { ...c.brand, ...partial } }))
  }

  function updateCta(partial) {
    setConfig(c => ({ ...c, cta: { ...c.cta, ...partial } }))
  }

  function setInputs(inputs) {
    setConfig(c => ({ ...c, inputs }))
  }

  function setOutputs(outputs) {
    setConfig(c => ({ ...c, outputs }))
  }

  const stepProps = { config, update, updateBrand, updateCta, setInputs, setOutputs }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-logo">
          <div className="logo-icon">📊</div>
          ROI Calculator Builder
        </div>
        <div className="app-header-badge">v{version}</div>
      </header>

      <div className="app-body">
        <StepNav steps={STEPS} active={step} onChange={setStep} />

        <main className="center">
          {step === 'info' && <InfoStep {...stepProps} />}
          {step === 'branding' && <BrandingStep {...stepProps} />}
          {step === 'inputs' && <InputsStep {...stepProps} />}
          {step === 'outputs' && <OutputsStep {...stepProps} />}
          {step === 'cta' && <CtaStep {...stepProps} />}
        </main>

        <aside className="right-panel">
          <div className="right-panel-tabs">
            <button
              className={`right-panel-tab${rightTab === 'preview' ? ' active' : ''}`}
              onClick={() => setRightTab('preview')}
            >
              Live Preview
            </button>
            <button
              className={`right-panel-tab${rightTab === 'embed' ? ' active' : ''}`}
              onClick={() => setRightTab('embed')}
            >
              Embed Code
            </button>
          </div>

          <div className="right-panel-body">
            {rightTab === 'preview' ? (
              <LivePreview config={config} />
            ) : (
              <EmbedCode config={config} loadConfig={loadConfig} />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
