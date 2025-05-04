'use client';


import type { StoreProduct } from '@medusajs/types';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductNewEditForm } from '../product-new-edit-form';


// ----------------------------------------------------------------------

type Props = {
  product?: StoreProduct;
};

export function ProductEditView({ product }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.dashboard.product.root}
        links={[
          { name: 'Trang chủ', href: paths.dashboard.root },
          { name: 'Sản phẩm', href: paths.dashboard.product.root },
          { name: product?.title },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ProductNewEditForm currentProduct={product} />
    </DashboardContent>
  );
}
