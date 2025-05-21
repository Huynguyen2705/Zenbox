import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { completeOrderWorkflow } from '@medusajs/medusa/core-flows';

export default async function orderPaymentCapturedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  // Your logic here, e.g., logging or triggering a workflow
  const logger = container.resolve("logger")
  logger.info(`Payment captured for order ${data.id}`);
  await completeOrderWorkflow(container).run({
    input: {
      orderIds: [data.id],
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.payment_captured",
}