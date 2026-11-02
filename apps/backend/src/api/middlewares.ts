import { configureStoreSearch, defineMiddlewares, MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { verifyIdJwt } from '../lib/id/verify-token'

export async function idAuthMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const authHeader = req.headers['authorization']

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const idUser = await verifyIdJwt(token)

    if (idUser) {
      ;(req as any).idUser = idUser
    }
  }

  return next()
}

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      matcher: '/store/*',
      middlewares: [idAuthMiddleware],
    },
    {
      method: ['POST'],
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
  ],
})
