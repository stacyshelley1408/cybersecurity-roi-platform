import { useState } from 'react'
import './App.css'
import StepNav from './components/StepNav'
import LivePreview from './components/LivePreview'
import EmbedCode from './components/EmbedCode'
import InfoStep from './components/steps/InfoStep'
import BrandingStep from './components/steps/BrandingStep'
import InputsStep from './components/steps/InputsStep'
import OutputsStep from './components/steps/OutputsStep'
import CtaStep from './components/steps/CtaStep'

export const DEFAULT_CONFIG = {
  title: 'Security ROI Calculator',
  description: 'Quantify your total cybersecurity risk exposure across breaches, incidents, staffing, and compliance — and see how much your organization can save.',
  brand: {
    primaryColor: '#2563eb',
    accentColor: '#16a34a',
    fontFamily: 'Inter, system-ui, sans-serif',
    logoUrl: '',
  },
  inputs: [
    // ── Staffing ──
    {
      id: 'employees',
      label: 'Number of Employees',
      type: 'range',
      default: 500,
      min: 10,
      max: 10000,
      step: 10,
      prefix: '',
      suffix: '',
    },
    {
      id: 'avg_salary',
      label: 'Average FTE Salary',
      type: 'number',
      default: 124910,
      min: 1,
      max: 500000,
      step: 1000,
      prefix: '$',
      suffix: '',
    },
    // ── Incidents & escalation ──
    // These drive both incident management costs and breach likelihood.
    // A security product reduces incidents_per_year, which reduces both.
    {
      id: 'incidents_per_year',
      label: 'Security Incidents / Year',
      type: 'range',
      default: 60,
      min: 5,
      max: 500,
      step: 5,
      prefix: '',
      suffix: '',
    },
    {
      id: 'hours_per_incident',
      label: 'Avg. Hours to Resolve Incident',
      type: 'range',
      default: 6,
      min: 1,
      max: 40,
      step: 1,
      prefix: '',
      suffix: '',
    },
    {
      id: 'escalation_rate',
      label: 'Incident-to-Breach Escalation Rate',
      type: 'number',
      default: 3,
      min: 0.1,
      max: 25,
      step: 0.5,
      prefix: '',
      suffix: '%',
    },
    // ── Breach cost factors (what it costs when an incident escalates) ──
    {
      id: 'records_at_risk',
      label: 'Records / Accounts at Risk',
      type: 'number',
      default: 50000,
      min: 100,
      max: 100000000,
      step: 1000,
      prefix: '',
      suffix: '',
    },
    {
      id: 'cost_per_record',
      label: 'Cost per Record Exposed',
      type: 'number',
      default: 60,
      min: 1,
      max: 500,
      step: 5,
      prefix: '$',
      suffix: '',
    },
    {
      id: 'downtime_days',
      label: 'Expected Downtime (days)',
      type: 'range',
      default: 21,
      min: 1,
      max: 90,
      step: 1,
      prefix: '',
      suffix: '',
    },
    {
      id: 'daily_revenue',
      label: 'Daily Revenue',
      type: 'number',
      default: 25000,
      min: 0,
      max: 10000000,
      step: 1000,
      prefix: '$',
      suffix: '',
    },
    {
      id: 'ir_cost',
      label: 'Detection & Investigation Cost',
      type: 'number',
      default: 75000,
      min: 0,
      max: 5000000,
      step: 5000,
      prefix: '$',
      suffix: '',
    },
    {
      id: 'notification_legal_cost',
      label: 'Notification & Legal Cost',
      type: 'number',
      default: 50000,
      min: 0,
      max: 5000000,
      step: 5000,
      prefix: '$',
      suffix: '',
    },
    {
      id: 'customer_base',
      label: 'Total Customer Count',
      type: 'number',
      default: 2000,
      min: 0,
      max: 10000000,
      step: 100,
      prefix: '',
      suffix: '',
    },
    {
      id: 'post_breach_churn',
      label: 'Estimated Post-Breach Churn',
      type: 'number',
      default: 3,
      min: 0,
      max: 50,
      step: 1,
      prefix: '',
      suffix: '%',
    },
    {
      id: 'customer_ltv',
      label: 'Avg. Customer Lifetime Value',
      type: 'number',
      default: 15000,
      min: 0,
      max: 10000000,
      step: 500,
      prefix: '$',
      suffix: '',
    },
    // ── Compliance ──
    {
      id: 'annual_audit_cost',
      label: 'Annual Compliance & Audit Costs',
      type: 'number',
      default: 175000,
      min: 0,
      max: 5000000,
      step: 5000,
      prefix: '$',
      suffix: '',
    },
    {
      id: 'fine_exposure',
      label: 'Annual Regulatory Fine Exposure',
      type: 'number',
      default: 400000,
      min: 0,
      max: 50000000,
      step: 10000,
      prefix: '$',
      suffix: '',
    },
  ],
  outputs: [
    {
      id: 'breach_exposure',
      label: 'Expected Annual Breach Cost',
      formula: '(incidents_per_year * escalation_rate / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv)',
      format: 'currency',
      highlight: false,
    },
    {
      id: 'incident_mgmt_cost',
      label: 'Incident Management Cost',
      formula: 'incidents_per_year * hours_per_incident * (avg_salary / 2080)',
      format: 'currency',
      highlight: false,
    },
    {
      id: 'productivity_loss',
      label: 'Staff Productivity Loss',
      formula: 'employees * avg_salary * 0.05',
      format: 'currency',
      highlight: false,
    },
    {
      id: 'compliance_burden',
      label: 'Compliance & Regulatory Risk',
      formula: 'annual_audit_cost + fine_exposure * 0.15',
      format: 'currency',
      highlight: false,
    },
    {
      id: 'total_exposure',
      label: 'Total Annual Risk Exposure',
      formula: '(incidents_per_year * escalation_rate / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + incidents_per_year * hours_per_incident * (avg_salary / 2080) + employees * avg_salary * 0.05 + annual_audit_cost + fine_exposure * 0.15',
      format: 'currency',
      highlight: true,
    },
    {
      id: 'total_savings',
      label: 'Estimated Annual Savings',
      formula: '((incidents_per_year * escalation_rate / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + incidents_per_year * hours_per_incident * (avg_salary / 2080) + employees * avg_salary * 0.05 + annual_audit_cost + fine_exposure * 0.15) * 0.65',
      format: 'currency',
      highlight: false,
    },
    {
      id: 'roi',
      label: 'ROI',
      formula: '((incidents_per_year * escalation_rate / 100) * Math.sqrt(employees / 10000) * (records_at_risk * cost_per_record + downtime_days * daily_revenue + ir_cost + notification_legal_cost + customer_base * (post_breach_churn / 100) * customer_ltv) + incidents_per_year * hours_per_incident * (avg_salary / 2080) + employees * avg_salary * 0.05 + annual_audit_cost + fine_exposure * 0.15) * 0.65 / 50000 * 100',
      format: 'percent',
      highlight: false,
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

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [step, setStep] = useState('info')
  const [rightTab, setRightTab] = useState('preview')

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
        <div className="app-header-badge">BETA</div>
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
              <EmbedCode config={config} />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
