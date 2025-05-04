import { sdk } from 'src/lib/medusa';

// ----------------------------------------------------------------------

export async function getProducts() {
  // const res = await axios.get(endpoints.product.list);
  const res = await sdk.store.product.list({
    limit: 100,
    offset: 0,
    region_id: process.env.NEXT_PUBLIC_REGION_ID
  });
  console.log({ res: JSON.stringify(res.products) })
  return res;
}

// ----------------------------------------------------------------------

export async function getProduct(id: string) {

  const res = await sdk.store.product.retrieve(id, { region_id: process.env.NEXT_PUBLIC_REGION_ID });

  return res;
}
