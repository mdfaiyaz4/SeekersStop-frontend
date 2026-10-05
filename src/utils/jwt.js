export function decodeJwt(token) {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const binary = window.atob(padded)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes))

    return {
      username: typeof payload.sub === 'string' ? payload.sub : null,
      role: typeof payload.role === 'string' ? payload.role : null,
    }
  } catch {
    return null
  }
}
