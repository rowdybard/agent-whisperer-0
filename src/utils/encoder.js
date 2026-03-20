/**
 * Encodes a custom level object into a Base64 URL-safe string.
 * Usage: /play?challenge=<encoded>
 */
export function encodeLevel(levelObject) {
  try {
    const json = JSON.stringify(levelObject)
    const encoded = btoa(unescape(encodeURIComponent(json)))
    return encoded
  } catch (err) {
    console.error('[encoder] Failed to encode level:', err)
    return null
  }
}

/**
 * Decodes a Base64 URL-safe string back into a level object.
 * Returns null if decoding fails.
 */
export function decodeLevel(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)))
    const parsed = JSON.parse(json)
    return validateCustomLevel(parsed) ? parsed : null
  } catch (err) {
    console.error('[encoder] Failed to decode level:', err)
    return null
  }
}

/**
 * Generates a shareable URL for a custom level.
 */
export function generateShareURL(levelObject) {
  const encoded = encodeLevel(levelObject)
  if (!encoded) return null
  const base = window.location.origin
  return `${base}?challenge=${encoded}`
}

/**
 * Parses the ?challenge= query param from the current URL.
 * Returns decoded level object or null.
 */
export function parseChallengeFromURL() {
  const params = new URLSearchParams(window.location.search)
  const challenge = params.get('challenge')
  if (!challenge) return null
  return decodeLevel(challenge)
}

/**
 * Validates that a decoded level has the minimum required fields.
 */
function validateCustomLevel(obj) {
  if (!obj || typeof obj !== 'object') return false
  const required = ['title', 'objective', 'winCondition']
  return required.every((key) => key in obj)
}
