import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getProducts, getCategories } from 'src/actions/product-ssr';

import { ProductShopView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Product shop - ${CONFIG.appName}` };

export default async function Page({ params }: { params: { handle: string } }) {
  const categories = await getCategories(params.handle);
  const { products } = await getProducts(categories[0]?.id);


  return <ProductShopView products={products} />;
}
