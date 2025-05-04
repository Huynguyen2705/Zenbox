export enum ROLES {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export enum PRODUCT_SORT_TYPE {
  NEWEST = 'newest',
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC'
}

export const MAP_SORT_TYPE: Record<string, string> = {
  [PRODUCT_SORT_TYPE.NEWEST]: '-created_at',
  [PRODUCT_SORT_TYPE.PRICE_ASC]: '-variants[0].calculated_price.calculated_amount',
  [PRODUCT_SORT_TYPE.PRICE_DESC]: '+variants[0].calculated_price.calculated_amount',
}