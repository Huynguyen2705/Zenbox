import { sdk } from 'src/lib/medusa';

// ----------------------------------------------------------------------

export async function getProducts(categoryId?: string) {
  // const res = await axios.get(endpoints.product.list);
  const res = await sdk.store.product.list({
    limit: 100,
    offset: 0,
    region_id: process.env.NEXT_PUBLIC_REGION_ID,
    category_id: categoryId
  });
  console.log({ res: JSON.stringify(res.products) })
  return res;
}

export async function getCategories(handle?: string) {
  try {
    const res = await sdk.store.category.list({
      handle
    })

    return res.product_categories;
  } catch (error) {
    console.log(error)
  }

  return []
}


export async function getRegions() {
  try {
    const res = await sdk.store.region.list()

    return res.regions;
  } catch (error) {
    console.log(error)
  }

  return []
}

// ----------------------------------------------------------------------

export async function getProduct(id: string) {

  const res = await sdk.store.product.retrieve(id, {
    region_id: process.env.NEXT_PUBLIC_REGION_ID,
    fields: "*variants.calculated_price,+variants.inventory_quantity"
  });

  return res;
}
