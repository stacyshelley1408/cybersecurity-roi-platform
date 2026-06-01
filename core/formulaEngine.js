export function evalFormula(formula, vars) {
  try {
    const keys = Object.keys(vars)
    const vals = keys.map(k => vars[k])
    // eslint-disable-next-line no-new-func
    const fn = Function(...keys, '"use strict"; return (' + formula + ');')
    const result = fn(...vals)
    return typeof result === 'number' && isFinite(result) ? result : 0
  } catch (_) {
    return 0
  }
}

export function formatValue(value, format) {
  const n = typeof value === 'number' && isFinite(value) ? value : 0
  switch (format) {
    case 'currency':
      return '$' + Math.round(n).toLocaleString()
    case 'currency_k':
      return n >= 1000000
        ? '$' + (n / 1000000).toFixed(1) + 'M'
        : n >= 1000
        ? '$' + (n / 1000).toFixed(0) + 'K'
        : '$' + Math.round(n).toLocaleString()
    case 'percent':
      return (Math.round(n * 10) / 10).toLocaleString() + '%'
    case 'number':
      return Math.round(n).toLocaleString()
    case 'number_1dp':
      return (Math.round(n * 10) / 10).toLocaleString()
    case 'months': {
      const m = Math.round(n)
      return m + (m === 1 ? ' month' : ' months')
    }
    case 'hours': {
      const h = Math.round(n)
      return h.toLocaleString() + (h === 1 ? ' hour' : ' hours')
    }
    case 'days': {
      const d = Math.round(n)
      return d.toLocaleString() + (d === 1 ? ' day' : ' days')
    }
    default:
      return (Math.round(n * 100) / 100).toLocaleString()
  }
}
