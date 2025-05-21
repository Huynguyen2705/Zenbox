'use client';


import type { StoreProduct } from '@medusajs/types';

import { useTabs } from 'minimal-shared/hooks';
import { varAlpha } from 'minimal-shared/utils';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CartIcon } from '../cart-icon';
import { useCheckoutContext } from '../../checkout/context';
import { ProductDetailsSummary } from '../product-details-summary';
import { ProductDetailsCarousel } from '../product-details-carousel';
import { ProductDetailsDescription } from '../product-details-description';

// ----------------------------------------------------------------------

const SUMMARY = [
  {
    title: '100% chính hãng',
    description: 'Tất cả sản phẩm đều chính hãng, có tem và hóa đơn đầy đủ.',
    icon: 'solar:verified-check-bold',
  },
  {
    title: 'Đổi trả trong 10 ngày',
    description: 'Hỗ trợ đổi trả trong vòng 10 ngày nếu có lỗi của nhà sản xuất.',
    icon: 'solar:clock-circle-bold',
  },
  {
    title: 'Vệ sinh miễn phí',
    description: 'Miễn phí vệ sinh laptop trọn đời',
    icon: 'solar:shield-check-bold',
  },
];

// ----------------------------------------------------------------------

type Props = {
  product?: StoreProduct;
};

export function ProductShopDetailsView({ product }: Props) {
  const { state: checkoutState, onAddToCart } = useCheckoutContext();

  const tabs = useTabs('description');
  console.log({ product })
  return (
    <Container sx={{ mt: 5, mb: 10 }}>
      <CartIcon totalItems={checkoutState.totalItems} />

      <CustomBreadcrumbs
        links={[
          { name: 'Trang chủ', href: '/' },
          { name: 'Cửa hàng', href: paths.product.root },
          { name: product?.title },
        ]}
        sx={{ mb: 5 }}
      />

      <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
        <Grid size={{ xs: 12, md: 6, lg: 7 }}>
          <ProductDetailsCarousel images={product?.images?.map(item => item.url)} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 5 }}>
          {product && (
            <ProductDetailsSummary
              product={product}
              items={checkoutState.items}
              onAddToCart={onAddToCart}
            // disableActions={!product?.available}
            />
          )}
        </Grid>
      </Grid>
      <Box
        sx={{
          gap: 5,
          my: 10,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' },
        }}
      >
        {SUMMARY.map((item) => (
          <Box key={item.title} sx={{ textAlign: 'center', px: 5 }}>
            <Iconify icon={item.icon} width={32} sx={{ color: 'primary.main' }} />

            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
              {item.title}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <Card>
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={[
            (theme) => ({
              px: 3,
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }),
          ]}
        >
          {[
            { value: 'description', label: 'Chi tiết sản phẩm' },
            // { value: 'reviews', label: `Reviews (${product?.reviews.length})` },
          ].map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {tabs.value === 'description' && (
          <ProductDetailsDescription description={product?.description ?? ''} />
        )}

        {/* {tabs.value === 'reviews' && (
          <ProductDetailsReview
            ratings={product?.ratings}
            reviews={product?.reviews}
            totalRatings={product?.totalRatings}
            totalReviews={product?.totalReviews}
          />
        )} */}
      </Card>
    </Container>
  );
}
