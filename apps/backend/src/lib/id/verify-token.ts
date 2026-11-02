import crypto from "crypto"

export interface IdUserPayload {
  sub: string
  email: string
  role?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}

let cachedJwks: { keys: any[] } | null = null
let lastJwksFetch = 0

async function getJwks() {
  const now = Date.now()
  if (cachedJwks && now - lastJwksFetch < 1000 * 60 * 10) {
    return cachedJwks
  }

  const idUrl = process.env.ID_URL || "http://127.0.0.1:55321"
  const res = await fetch(`${idUrl}/auth/v1/.well-known/jwks.json`)
  if (!res.ok) {
    throw new Error(`Failed to fetch JWKS from ID Platform: ${res.statusText}`)
  }

  cachedJwks = await res.json()
  lastJwksFetch = now
  return cachedJwks
}

/**
 * Verifies asymmetric ES256 / Ed25519 JWT issued by the ID Platform (Supabase Auth 2026 standards)
 * using public JWKS endpoint without requiring shared secrets.
 */
export async function verifyIdJwt(token: string): Promise<IdUserPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts
    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"))
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"))

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }

    const jwks = await getJwks()
    const matchingKey = jwks.keys.find((k: any) => !header.kid || k.kid === header.kid)

    if (!matchingKey) {
      return null
    }

    const publicKey = crypto.createPublicKey({
      key: {
        kty: matchingKey.kty,
        crv: matchingKey.crv,
        x: matchingKey.x,
        y: matchingKey.y,
      },
      format: "jwk",
    })

    const verifier = crypto.createVerify("SHA256")
    verifier.update(`${headerB64}.${payloadB64}`)

    const isValid = verifier.verify(
      { key: publicKey, dsaEncoding: "ieee-p1363" },
      Buffer.from(signatureB64, "base64url")
    )

    if (!isValid) return null

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      app_metadata: payload.app_metadata,
      user_metadata: payload.user_metadata,
    }
  } catch (err) {
    return null
  }
}
