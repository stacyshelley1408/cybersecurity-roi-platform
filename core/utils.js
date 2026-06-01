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
