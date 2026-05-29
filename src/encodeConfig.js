export function encodeConfig(config) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(config))))
}
