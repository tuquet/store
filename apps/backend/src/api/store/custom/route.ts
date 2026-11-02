import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: any, res: MedusaResponse) {
  res.sendStatus(200)
}
