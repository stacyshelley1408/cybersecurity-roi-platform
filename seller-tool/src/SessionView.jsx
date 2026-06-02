import { useState, useCallback } from 'react'
import { getFlatInputs, safeUrl } from '@core/utils'
import ProspectPanel from './components/ProspectPanel.jsx'
import AssumptionsPanel from './components/AssumptionsPanel.jsx'
import StepPanel from './components/StepPanel.jsx'
import OutputPanel from './components/OutputPanel.jsx'

export default function SessionView({ state, onChange, onBuildLeaveBehind }) {
  const { config, prospect } = state
  const [assumptionsOpen, setAssumptionsOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  const primary = config.brand?.primaryColor || '#1a8a80'
  const productName = config.productName || 'Our Product'
  const useGroups = Boolean(config.inputGroups)

  function updateProspect(partial) {
    onChange({ ...state, prospect: { ...prospect, ...partial } })
  }

  function setInputValue(id, value) {
    onChange({
      ...state,
      prospect: {
        ...prospect,
        inputValues: { ...prospect.inputValues, [id]: value },
      },
    })
  }

  const inputValues = useCallback(() => {
    const vals = {}
    for (const inp of getFlatInputs(config)) {
      vals[inp.id] = prospect.inputValues?.[inp.id] ?? inp.default ?? 0
    }
    return vals
  }, [config, prospect.inputValues])

  // Build step list for grouped configs: profile + non-all-locked groups
  const steps = useGroups ? [
    { id: 'profile', label: 'Prospect Profile', isProfile: true },
    ...(config.inputGroups.filter(g => g.inputs.some(i => i.sellerAccess !== 'locked'))),
  ] : null

  return (
    <div className="session-layout">
      <header className="session-header" style={{ borderBottomColor: primary }}>
        <div className="session-header-left">
          {config.brand?.logoUrl && (
            <img src={safeUrl(config.brand.logoUrl)} alt="" className="session-logo" />
          )}
          <span className="session-product">{productName}</span>
          <span className="session-divider">·</span>
          <span className="session-subtitle">ROI Analysis</span>
        </div>
        <div className="session-header-right">
          <button
            className="btn-leave-behind"
            style={{ background: primary }}
            onClick={() => onBuildLeaveBehind(state)}
          >
            Build Leave-Behind
          </button>
        </div>
      </header>

      <div className="session-body">
        <aside className="session-left">
          {useGroups ? (
            <StepPanel
              steps={steps}
              activeStep={activeStep}
              onStepChange={setActiveStep}
              prospect={prospect}
              inputValues={inputValues()}
              onProspectChange={updateProspect}
              onInputChange={setInputValue}
              primary={primary}
              onLeaveBehind={() => onBuildLeaveBehind(state)}
            />
          ) : (
            <>
              <ProspectPanel
                prospect={prospect}
                visibleInputs={getFlatInputs(config).filter(i => i.visible !== false)}
                inputGroups={null}
                inputValues={inputValues()}
                onProspectChange={updateProspect}
                onInputChange={setInputValue}
                primary={primary}
              />
              <AssumptionsPanel
                hiddenInputs={getFlatInputs(config).filter(i => i.visible === false)}
                inputGroups={null}
                inputValues={inputValues()}
                onInputChange={setInputValue}
                open={assumptionsOpen}
                onToggle={() => setAssumptionsOpen(o => !o)}
                primary={primary}
              />
            </>
          )}
        </aside>

        <main className="session-right">
          <OutputPanel
            config={config}
            inputValues={inputValues()}
            prospect={prospect}
            primary={primary}
          />
        </main>
      </div>
    </div>
  )
}
