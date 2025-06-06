'use client';

import type { StoreProduct } from '@medusajs/types';
import type { IProductFilters, ProductVariantsRes } from 'src/types/product';

import useSWR from 'swr';
import { useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Pagination, paginationClasses } from '@mui/material';

import { paths } from 'src/routes/paths';

import { sdk } from 'src/lib/medusa';
import { CONFIG } from 'src/global-config';
import { PRODUCT_SORT_TYPE } from 'src/constants/enum';
import {
  _mock,
  PRODUCT_SORT_OPTIONS,
} from 'src/_mock';

import { EmptyContent } from 'src/components/empty-content';
import { Carousel, useCarousel, CarouselDotButtons } from 'src/components/carousel';

import { CartIcon } from '../cart-icon';
import { ProductSort } from '../product-sort';
import { ProductList } from '../product-list';
import { ProductSearch } from '../product-search';
import { useCheckoutContext } from '../../checkout/context';
import { ProductFiltersResult } from '../product-filters-result';

// ----------------------------------------------------------------------

type Props = {
  products: StoreProduct[];
  title?: string;
  categoryId?: string;
};

const limit = 20;
const SLIDES = Array.from({ length: 4 }, (_, index) => ({
  id: _mock.id(index),
  title: _mock.postTitle(index),
  coverUrl: `${CONFIG.assetsDir}/banner/banner-${index + 1}.jpg`,
  description: _mock.description(index),
}));

export function ProductShopView({ title, categoryId }: Props) {
  const { state: checkoutState } = useCheckoutContext();
  const [page, setPage] = useState<number>(1);


  const [sortBy, setSortBy] = useState<string>(PRODUCT_SORT_TYPE.NEWEST);

  const filters = useSetState<IProductFilters>({
    gender: [],
    colors: [],
    rating: '',
    category: 'all',
    priceRange: [0, 200],
  });
  const { state: currentFilters } = filters;
  const { data: productListRes, isLoading } = useSWR<ProductVariantsRes>(['product-list', sortBy, page], async () => {
    const res = await sdk.client.fetch('/store/custom/products', {
      query: {
        limit,
        offset: (page - 1) * limit,
        ...categoryId && {
          categoryId
        },
        sortField: sortBy === PRODUCT_SORT_TYPE.NEWEST ? 'created_at' : 'price',
        sortType: sortBy === PRODUCT_SORT_TYPE.NEWEST || sortBy === PRODUCT_SORT_TYPE.PRICE_DESC ? 'DESC' : 'ASC'
      },
      method: 'get',
    })

    return res as ProductVariantsRes;
  })



  const canReset =
    currentFilters.gender.length > 0 ||
    currentFilters.colors.length > 0 ||
    currentFilters.rating !== '' ||
    currentFilters.category !== 'all' ||
    currentFilters.priceRange[0] !== 0 ||
    currentFilters.priceRange[1] !== 200;

  const notFound = productListRes?.variants != null && !productListRes?.variants?.length && canReset;
  const productsEmpty = productListRes?.variants != null && !productListRes?.variants?.length;

  const renderFilters = () => (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-end', sm: 'center' },
      }}
    >
      <ProductSearch redirectPath={(id: string) => paths.product.details(id)} />

      <Box sx={{ gap: 1, flexShrink: 0, display: 'flex' }}>

        <ProductSort
          sort={sortBy}
          onSort={(newValue: string) => setSortBy(newValue)}
          sortOptions={PRODUCT_SORT_OPTIONS}
        />
      </Box>
    </Box>
  );

  const renderResults = () => (
    <ProductFiltersResult filters={filters} totalResults={productListRes?.totalCount ?? 0} />
  );

  const renderNotFound = () => <EmptyContent filled sx={{ py: 10 }} />;

  const carousel = useCarousel({ loop: true, slidesToShow: 1 }, [Autoplay({ playOnInit: true, delay: 5000, })]);


  return (
    <Container sx={{ mb: 15 }}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Carousel carousel={carousel} sx={{ borderRadius: 2 }}>
          {SLIDES.map((item, index) => (
            <CarouselItem key={item.id} index={index} item={item} />
          ))}
        </Carousel>

        <CarouselDotButtons
          scrollSnaps={carousel.dots.scrollSnaps}
          selectedIndex={carousel.dots.selectedIndex}
          onClickDot={carousel.dots.onClickDot}
          sx={{
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            position: 'absolute',
            color: 'common.white',
          }}
        />
      </Box>
      <CartIcon totalItems={checkoutState.totalItems} />

      <Typography variant="h4" sx={{ my: { xs: 3, md: 5 } }}>
        {title ?? ' Cửa hàng'}
      </Typography>

      <Stack spacing={2.5} sx={{ mb: { xs: 3, md: 5 } }}>
        {renderFilters()}
        {canReset && renderResults()}
      </Stack>

      {(notFound || productsEmpty) && renderNotFound()}

      <ProductList loading={isLoading} products={productListRes?.variants ?? []} />
      {productListRes && productListRes.totalCount > limit && (
        <Pagination
          page={page}
          onChange={(event, newPage) => setPage(newPage)}
          count={Math.ceil(productListRes.totalCount / limit)}
          sx={{
            mt: { xs: 5, md: 8 },
            [`& .${paginationClasses.ul}`]: { justifyContent: 'center' },
          }}
        />
      )}
    </Container>
  );
}
type CarouselItemProps = {
  index: number;
  item: any;
};
function CarouselItem({ item, index }: CarouselItemProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="img"
        alt={item.title}
        src={item.coverUrl}
        sx={{ objectFit: 'cover', width: '100%', height: '50vh' }}
      />
    </Box>
  );
}
