import type { StoreProduct } from '@medusajs/types';
import type { CheckoutContextValue } from 'src/types/checkout';

import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency } from 'src/utils/format-number';
import { getProductPrice } from 'src/utils/get-product-price';

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { NumberInput } from 'src/components/number-input';

// ----------------------------------------------------------------------

type Props = {
  product: StoreProduct;
  disableActions?: boolean;
  items?: CheckoutContextValue['state']['items'];
  onAddToCart?: CheckoutContextValue['onAddToCart'];
};

export function ProductDetailsSummary({
  items,
  product,
  onAddToCart,
  disableActions,
  ...other
}: Props) {
  const router = useRouter();

  const {
    id,
    options,
    variants
  } = product;

  const existProduct = !!items?.length && items.map((item) => item.id).includes(id);

  const isMaxQuantity = Number.MAX_SAFE_INTEGER
  // !!items?.length &&
  // items.filter((item) => item.id === id).map((item) => item.quantity)[0] >= available;

  const defaultValues = {
    id,
    name: product.title,
    coverUrl: product.thumbnail,
    available: 1000,
    price: 1000,
    quantity: 1,
    options: []
  };

  const methods = useForm<typeof defaultValues>({
    defaultValues,
  });

  const { watch, control, setValue, handleSubmit } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    console.info('DATA', JSON.stringify(data, null, 2));

    try {
      if (!existProduct) {
        // onAddToCart?.({ ...data, colors: [values.colors] });
      }
      router.push(paths.product.checkout);
    } catch (error) {
      console.error(error);
    }
  });

  const handleAddCart = useCallback(() => {
    try {
      // onAddToCart?.({
      //   ...values,
      //   colors: [values.colors],
      //   subtotal: values.price * values.quantity,
      // });
    } catch (error) {
      console.error(error);
    }
  }, [onAddToCart, values]);
  const { cheapestPrice: price, variantPrice } = getProductPrice({ product, variantId: product.variants?.[0].id })

  const renderPrice = () => (
    <Box sx={{ typography: 'h5' }}>
      {/* {priceSale && (
        <Box
          component="span"
          sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
        >
          {fCurrency(priceSale)}
        </Box>
      )} */}

      {fCurrency(price?.calculated_price_number)}
    </Box>
  );

  const renderOptions = () => options?.map((option, index) => (
    <Box key={index} mb={2}>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>{option.title}</Typography>
      <Controller
        name={`options.${index}` as any} // access as selections[0], selections[1]
        control={control}
        render={({ field }) => (
          <ToggleButtonGroup
            exclusive
            value={field.value}
            onChange={(_, value) => {
              if (value !== null) field.onChange(value);
            }}
          >
            {option.values?.map((choice) => (
              <ToggleButton key={choice.id} value={choice.id}>
                {choice.value}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      />
    </Box>
  ))


  const renderColorOptions = () => (
    <Box sx={{ display: 'flex' }}>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Color
      </Typography>

      {/* <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <ColorPicker
            options={colors}
            value={field.value}
            onChange={(color) => field.onChange(color as string)}
            limit={4}
          />
        )}
      /> */}
    </Box>
  );

  const renderSizeOptions = () => (
    <Box sx={{ display: 'flex' }}>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Size
      </Typography>

      {/* <Field.Select
        name="size"
        size="small"
        helperText={
          <Link underline="always" color="text.primary">
            Size chart
          </Link>
        }
        sx={{
          maxWidth: 88,
          [`& .${formHelperTextClasses.root}`]: { mx: 0, mt: 1, textAlign: 'right' },
        }}
      > */}
      {/* {sizes.map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))} */}
      {/* </Field.Select> */}
    </Box>
  );

  const renderQuantity = () => (
    <Box sx={{ display: 'flex' }}>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Số lượng
      </Typography>

      <Stack spacing={1}>
        <NumberInput
          hideDivider
          value={values.quantity}
          onChange={(event, quantity: number) => setValue('quantity', quantity)}
          // max={available}
          sx={{ maxWidth: 112 }}
        />

        {/* <Typography
          variant="caption"
          component="div"
          sx={{ textAlign: 'right', color: 'text.secondary' }}
        >
          Available: {available}
        </Typography> */}
      </Stack>
    </Box>
  );

  const renderActions = () => (
    <Box sx={{ gap: 2, display: 'flex' }}>
      <Button
        fullWidth
        // disabled={isMaxQuantity || disableActions}
        size="large"
        color="warning"
        variant="contained"
        startIcon={<Iconify icon="solar:cart-plus-bold" width={24} />}
        onClick={handleAddCart}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Thêm vào giỏ hàng
      </Button>

      <Button fullWidth size="large" type="submit" variant="contained" disabled={disableActions}>
        Mua ngay
      </Button>
    </Box>
  );

  const renderSubDescription = () => (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {/* {subDescription} */}
      {product.subtitle}
    </Typography>
  );

  const renderRating = () => (
    <Box
      sx={{
        display: 'flex',
        typography: 'body2',
        alignItems: 'center',
        color: 'text.disabled',
      }}
    >
      {/* <Rating size="small" value={totalRatings} precision={0.1} readOnly sx={{ mr: 1 }} />
      {`(${fShortenNumber(totalReviews)} reviews)`} */}
    </Box>
  );

  // const renderLabels = () =>
  //   (newLabel.enabled || saleLabel.enabled) && (
  //     <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
  //       {newLabel.enabled && <Label color="info">{newLabel.content}</Label>}
  //       {saleLabel.enabled && <Label color="error">{saleLabel.content}</Label>}
  //     </Box>
  //   );

  // const renderInventoryType = () => (
  //   <Box
  //     component="span"
  //     sx={{
  //       typography: 'overline',
  //       color:
  //         (inventoryType === 'out of stock' && 'error.main') ||
  //         (inventoryType === 'low stock' && 'warning.main') ||
  //         'success.main',
  //     }}
  //   >
  //     {inventoryType}
  //   </Box>
  // );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ pt: 3 }} {...other}>
        <Stack spacing={2} alignItems="flex-start">
          {/* {renderLabels()}
          {renderInventoryType()} */}

          <Typography variant="h5">{product.title}</Typography>

          {renderRating()}
          {renderPrice()}
          {renderSubDescription()}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderOptions()}
        {renderQuantity()}

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderActions()}

      </Stack>
    </Form>
  );
}
