export function encodeState(state) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))))
}

export function decodeState(b64) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))))
  } catch (_) {
    return null
  }
}

// Parse the URL hash into { view, state }.
// Supported formats:
//   #config/<b64>   — session view, template config only (from builder link)
//   #session/<b64>  — session view, full state (config + prospect)
//   #summary/<b64>  — summary/leave-behind view
export function parseHash(hash) {
  const raw = hash.replace(/^#/, '')
  const slash = raw.indexOf('/')
  if (slash === -1) return { view: 'empty', state: null }
  const prefix = raw.slice(0, slash)
  const b64 = raw.slice(slash + 1)
  const decoded = decodeState(b64)
  if (!decoded) return { view: 'error', state: null }

  if (prefix === 'config') {
    // Builder generated link — decoded value is the template config directly
    return { view: 'session', state: { config: decoded, prospect: defaultProspect() } }
  }
  if (prefix === 'session') return { view: 'session', state: decoded }
  if (prefix === 'summary') return { view: 'summary', state: decoded }
  return { view: 'empty', state: null }
}

export function buildSessionHash(state) {
  return '#session/' + encodeState(state)
}

export function buildSummaryHash(state) {
  return '#summary/' + encodeState(state)
}

export function defaultProspect() {
  return {
    companyName: '',
    contactName: '',
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    date: new Date().toISOString().slice(0, 10),
    inputValues: {},
  }
}
