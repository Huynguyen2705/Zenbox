import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
  QueryContext,
} from "@medusajs/framework/utils"
type QueryVariantsParams = {
  sortType: 'ASC' | 'DESC',
  sortField: 'created' | 'price',
  limit: number;
  offset: number;
}
export const GET = async (
  req: MedusaRequest<unknown, QueryVariantsParams>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const params = req.query;
  const filters = {
    product: {
      status: ProductStatus.PUBLISHED,
    } as any
  }

  const offset = Number(params.offset) || 0
  const limit = Number(params.limit) || 10

  logger.info(`[GET] custom variants: ${JSON.stringify(params)}`)
  console.log(params)
  let { data: variants, metadata } = await query.graph({
    entity: "variant",
    fields: ["id", "created_at", 'product.categories.id', "title", "product.*", 'calculated_price.calculated_amount', 'price_set.*'],
    context: {
      calculated_price: QueryContext({
        currency_code: "vnd",
        // Optionally, you can add region_id or other context properties here
      }),

      // region_id: 'reg_01JRX2W81V3JE21BV18DNQ14XK',
      // currency_code: 'vnd'
    },
    filters
    ,
  },);

  if (params.categoryId) {
    variants = variants.filter(item => item.product?.categories?.some(category => category?.id === params.categoryId))
  }
  const totalCount = variants.length;

  if (params.sortField === 'price') {
    variants = variants.sort((a, b) => (params.sortType === 'ASC' ? 1 : -1) * ((a.price_set?.calculated_price?.calculated_amount || 0) - (b.price_set?.calculated_price?.calculated_amount ?? 0))).slice(offset, offset + limit)
  } else if (params.sortField === 'created_at') {
    variants = variants.sort((a, b) => (params.sortType === 'ASC' ? 1 : -1) * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())).slice(offset, offset + limit)
  }

  res.json({ variants, totalCount: metadata?.count || totalCount || 0, offset, limit })

}