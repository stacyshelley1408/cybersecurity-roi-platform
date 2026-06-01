import { useState, useCallback } from 'react'
import { getFlatInputs } from '@core/utils'
import ProspectPanel from './components/ProspectPanel.jsx'
import AssumptionsPanel from './components/AssumptionsPanel.jsx'
import OutputPanel from './components/OutputPanel.jsx'

export default function SessionView({ state, onChange, onBuildLeaveHehind }) {
  const { config, prospect } = state
  const [assumptionsOpen, setAssumptionsOpen] = useState(false)

  const primary = config.brand?.primaryColor || '#1a8a80'
  const productName = config.productName || 'Our Product'

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

  // Support both grouped (inputGroups) and flat (inputs) configs
  const useGroups = Boolean(config.inputGroups)
  const flatInputs = getFlatInputs(config)
  const visibleInputs = flatInputs.filter(i => useGroups
    ? (i.sellerAccess || 'prospect') === 'prospect'
    : i.visible !== false
  )
  const hiddenInputs = flatInputs.filter(i => useGroups
    ? i.sellerAccess === 'se'
    : i.visible === false
  )

  return (
    <div className="session-layout">
      <header className="session-header" style={{ borderBottomColor: primary }}>
        <div className="session-header-left">
          {config.brand?.logoUrl && (
            <img src={config.brand.logoUrl} alt="" className="session-logo" />
          )}
          <span className="session-product">{productName}</span>
          <span className="session-divider">·</span>
          <span className="session-subtitle">ROI Analysis</span>
        </div>
        <div className="session-header-right">
          <button
            className="btn-leave-behind"
            style={{ background: primary }}
            onClick={() => onBuildLeaveHehind(state)}
          >
            Build Leave-Behind
          </button>
        </div>
      </header>

      <div className="session-body">
        <aside className="session-left">
          <ProspectPanel
            prospect={prospect}
            visibleInputs={visibleInputs}
            inputGroups={useGroups ? config.inputGroups : null}
            inputValues={inputValues()}
            onProspectChange={updateProspect}
            onInputChange={setInputValue}
            primary={primary}
          />
          <AssumptionsPanel
            hiddenInputs={hiddenInputs}
            inputGroups={useGroups ? config.inputGroups : null}
            inputValues={inputValues()}
            onInputChange={setInputValue}
            open={assumptionsOpen}
            onToggle={() => setAssumptionsOpen(o => !o)}
            primary={primary}
          />
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
