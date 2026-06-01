export function encodeConfig(config) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(config))))
}

export function decodeConfig(b64) {
  return JSON.parse(decodeURIComponent(escape(atob(b64))))
}
