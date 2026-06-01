import { useState, useEffect } from 'react'
import { parseHash, buildSessionHash, buildSummaryHash } from './utils/hashState.js'
import SessionView from './SessionView.jsx'
import SummaryView from './SummaryView.jsx'

export default function App() {
  const [parsed, setParsed] = useState(() => parseHash(window.location.hash))

  // Keep state in URL hash so the page is always shareable/refreshable
  function updateState(newState) {
    const hash = buildSessionHash(newState)
    window.history.replaceState(null, '', hash)
    setParsed({ view: 'session', state: newState })
  }

  function goToSummary(state) {
    const hash = buildSummaryHash(state)
    window.history.replaceState(null, '', hash)
    setParsed({ view: 'summary', state })
  }

  function goToSession(state) {
    const hash = buildSessionHash(state)
    window.history.replaceState(null, '', hash)
    setParsed({ view: 'session', state })
  }

  // Handle browser back/forward
  useEffect(() => {
    function onHashChange() { setParsed(parseHash(window.location.hash)) }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (parsed.view === 'summary') {
    return <SummaryView state={parsed.state} onEdit={() => goToSession(parsed.state)} />
  }

  if (parsed.view === 'session') {
    return <SessionView state={parsed.state} onChange={updateState} onBuildLeaveHehind={goToSummary} />
  }

  // Empty state — no template loaded
  return (
    <div className="empty-state">
      <div className="empty-card">
        <h1>Security ROI Seller Tool</h1>
        <p>Open this tool from the ROI Calculator Builder for Sales using the <strong>Preview Session</strong> or <strong>Copy URL</strong> button.</p>
      </div>
    </div>
  )
}
