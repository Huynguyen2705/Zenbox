import useSWR from 'swr'
import { useMemo } from 'react'
import useMutation from 'swr/mutation'

import { sdk } from 'src/lib/medusa'
import { endpoints } from 'src/lib/axios'

import { toast } from 'src/components/snackbar'
import { useSettingsContext } from 'src/components/settings'


export const useProductIds = (productsIds: string[]) => {
  const { state } = useSettingsContext()
  const { data, isLoading } = useSWR(productsIds, async (ids) => {
    const res = await sdk.store.product.list({
      id: ids,
      region_id: state.regionId
    })

    return res.products
  })
  return {
    products: data,
    loadingProducts: isLoading
  }
}

export function useGetAdminProducts(query: { offset: number, limit: number }) {
  const url = endpoints.product.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR([url, query.offset], async () => {
    const res = await sdk.admin.product.list({
      limit: query.limit,
      offset: query.offset,
    })
    return res
  });

  const memoizedValue = useMemo(
    () => ({
      products: data?.products || [],
      productsLoading: isLoading,
      productsError: error,
      totalCount: data?.count,
      productsValidating: isValidating,
      refreshProducts: mutate,
      productsEmpty: !isLoading && !isValidating && !data?.products?.length,
    }),
    [data?.products, error, isLoading, isValidating]
  );

  return memoizedValue;
}
export const useDeleteProduct = () => {
  const { trigger, isMutating } = useMutation('/delete/mutations', async (key, options: { arg: { id: string } }) => {
    const res = await sdk.admin.product.delete(options.arg.id);
    return res;
  }, {
    onSuccess(data, key, config) {
      toast.success('Xoá sản phẩm thành công');
    },
    onError(err, key, config) {
      toast.error('Xoá sản phẩm thất bại')
    },
  })

  return {
    deleteProduct: trigger,
    loadingDeleteProduct: isMutating,
  }
}

