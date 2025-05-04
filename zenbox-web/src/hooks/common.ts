import useSWR from 'swr'
import { useEffect } from 'react';

import { sdk } from 'src/lib/medusa'

export const useCategories = (admin?: boolean) => {
  const { data, mutate, isLoading } = useSWR('category', async () => {
    if (admin) {
      const res = await sdk.admin.productCategory.list();
      return res.product_categories;
    }
    const res = await sdk.store.category.list({
      order: 'rank',

    });
    return res.product_categories;
  }, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (data == null) {
      mutate();
    }
  }, [])


  return {
    categories: data || [],
    fetchCategories: mutate,
    loadingCategories: isLoading
  }
}