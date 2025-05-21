import useSWR from 'swr';
import { useMemo } from 'react';
import useSWRMutation from 'swr/mutation';

import { sdk } from 'src/lib/medusa';

import { toast } from 'src/components/snackbar';

export function useGetAdminCategories(query: { offset: number, limit: number, name?: string }) {

  const { data, isLoading, error, isValidating, mutate } = useSWR(['admin/categories', query.offset], async () => {
    const res = await sdk.admin.productCategory.list({
      limit: query.limit,
      offset: query.offset,
      name: query.name
    })
    return res
  });

  const memoizedValue = useMemo(
    () => ({
      categories: data?.product_categories || [],
      categoriesLoading: isLoading,
      categoriesError: error,
      totalCount: data?.count,
      categoriesValidating: isValidating,
      refreshCategories: mutate,
      categoriesEmpty: !isLoading && !isValidating && !data?.product_categories?.length,
    }),
    [data?.product_categories, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export const useDeleteCategory = () => {
  const { trigger, isMutating } = useSWRMutation('/delete/categories', async (key, options: { arg: { id: string } }) => {
    const res = await sdk.admin.productCategory.delete(options.arg.id);
    return res;
  }, {
    onSuccess(data, key, config) {
      toast.success('Xoá danh mục thành công');
    },
    onError(err, key, config) {
      toast.error('Xoá danh mục thất bại')
    },
  })

  return {
    deleteCategory: trigger,
    loadingDeleteCategory: isMutating,
  }
}

