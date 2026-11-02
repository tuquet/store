import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

// In browser: must connect to host (http://localhost:9000). On server (SSR/Docker): can connect to internal container (http://medusa:9000) or fallback.
let MEDUSA_BACKEND_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL &&
      !process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL.includes("://medusa")
      ? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      : "http://localhost:9000"
    : process.env.MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
