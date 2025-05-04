import type { StoreProductVariant } from '@medusajs/types';
import type { ICheckoutState, ICheckoutViewItem } from 'src/types/checkout';

import { useMemo } from 'react';

import { useProductIds } from './product';

export const useCheckoutItems = (checkoutState: ICheckoutState) => {
  const { products } = useProductIds(checkoutState.items.map(item => item.productId));

  const checkoutItems: ICheckoutViewItem[] = useMemo(() => {
    if (!products) {
      return []
    }
    const mapVariants = products?.reduce((prev, curr) => {
      curr.variants?.forEach(variant => {
        prev[variant.id] = {
          ...variant,
          product: curr,
        }
      })
      return {
        ...prev
      }
    }, {} as Record<string, StoreProductVariant>)

    return checkoutState.items.filter(item => mapVariants[item.variantId] != null).map(item => ({
      ...item,
      ...mapVariants[item.variantId]
    }))
  }, [products, checkoutState.items])

  return { checkoutItems }
}