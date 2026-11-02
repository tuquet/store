import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Custom endpoint verifying ID integration: returns verified Supabase user payload
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const idUser = (req as any).idUser

  if (!idUser) {
    return res.status(401).json({
      authenticated: false,
      message: "No valid Central ID (Supabase) token provided",
    })
  }

  return res.json({
    authenticated: true,
    source: "id-platform (supabase)",
    user: idUser,
  })
}
