export function slugify(str, fallback = 'field') {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || fallback
}

// Returns a flat array of all inputs regardless of whether config uses inputGroups or flat inputs
export function getFlatInputs(config) {
  if (config.inputGroups) {
    return config.inputGroups.flatMap(g => g.inputs || [])
  }
  return config.inputs || []
}

// Validates a URL to http/https only; returns '#' for anything else
export function safeUrl(url) {
  try {
    const u = new URL(String(url))
    return u.protocol === 'http:' || u.protocol === 'https:' ? url : '#'
  } catch (_) {
    return '#'
  }
}
