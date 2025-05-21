import useSWR from 'swr';
import { useMemo } from 'react';

import { sdk } from 'src/lib/medusa';
import { endpoints } from 'src/lib/axios';

export function useGetAdminCustomers(query: { offset: number, limit: number }) {
  const url = endpoints.product.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR([url, query.offset], async () => {
    const res = await sdk.admin.customer.list({
      limit: query.limit,
      offset: query.offset,
    })
    return res
  });

  const memoizedValue = useMemo(
    () => ({
      customers: data?.customers || [],
      customersLoading: isLoading,
      customersError: error,
      totalCount: data?.count,
      customersValidating: isValidating,
      refreshUsers: mutate,
      customersEmpty: !isLoading && !isValidating && !data?.customers?.length,
    }),
    [data?.customers, error, isLoading, isValidating]
  );

  return memoizedValue;

}