'use client'

import useSWR from 'swr';
import React from 'react'

import { sdk } from 'src/lib/medusa';

import { ProductEditView } from 'src/sections/product/view';

type Props = {
  id: string;
}

const EditClient = (props: Props) => {
  const { data: product } = useSWR(['product/admin/detail', props.id], async () => {
    const res = await sdk.admin.product.retrieve(props.id, {
      fields: '*categories'
    });
    return res.product
  },)
  return <ProductEditView product={product} />;


}

export default EditClient