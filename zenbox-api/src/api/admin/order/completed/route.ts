import { logger } from '@medusajs/framework'
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { completeOrderWorkflow } from "@medusajs/medusa/core-flows"

export async function POST(req: MedusaRequest<{ orderIds: string[] }>, res: MedusaResponse) {
  const { orderIds } = req.body
  logger.info('POST COMPLETED ORDERS')
  const { result } = await completeOrderWorkflow(req.scope).run({
    input: {
      orderIds: orderIds, // Replace with your order IDs
      additional_data: {
        send_webhook: true, // Optional: pass any additional data needed by hooks
      },
    },
  })
  res.send(result)
}