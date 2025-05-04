

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useCheckoutItems } from 'src/hooks/checkout';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { useLoginModal } from 'src/components/auth/LoginFormDialog/action';

import { useAuthContext } from 'src/auth/hooks';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutCartProductList } from './checkout-cart-product-list';

// ----------------------------------------------------------------------

export function CheckoutCart() {
  const {
    loading,
    onChangeStep,
    onApplyDiscount,
    onDeleteCartItem,
    state: checkoutState,
    onChangeItemQuantity,
  } = useCheckoutContext();

  const { checkoutItems } = useCheckoutItems(checkoutState);
  const isCartEmpty = !checkoutState.items.length;
  const { showLogin } = useLoginModal();
  const { authenticated } = useAuthContext();

  const renderLoading = () => (
    <Box
      sx={{
        height: 340,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LinearProgress color="inherit" sx={{ width: 1, maxWidth: 320 }} />
    </Box>
  );

  const renderEmpty = () => (
    <EmptyContent
      title="Giỏ hàng trống!"
      description="Có vẻ như bạn không có sản phẩm nào trong giỏ hàng."
      imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-cart.svg`}
      sx={{ height: 340 }}
    />
  );

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title={
              <Typography variant="h6">
                {`Giỏ hàng `}
                <Typography component="span" sx={{ color: 'text.secondary' }}>
                  ({checkoutState.totalItems} sản phẩm)
                </Typography>
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          {loading ? (
            renderLoading()
          ) : (
            <>
              {isCartEmpty ? (
                renderEmpty()
              ) : (
                <CheckoutCartProductList
                  checkoutItems={checkoutItems}
                  onDeleteCartItem={onDeleteCartItem}
                  onChangeItemQuantity={onChangeItemQuantity}
                />
              )}
            </>
          )}
        </Card>

        <Button
          component={RouterLink}
          href={paths.product.root}
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          Tiếp tục mua sắm
        </Button>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <CheckoutSummary checkoutItems={checkoutItems} />

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={isCartEmpty}
          onClick={() => {
            if (authenticated) {
              onChangeStep('next');
              return;
            }
            showLogin(() => onChangeStep('next'));
          }}
        >
          Thanh toán
        </Button>
      </Grid>
    </Grid>
  );
}
