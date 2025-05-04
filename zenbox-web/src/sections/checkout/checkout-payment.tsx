import type {
  ICheckoutCardOption,
  ICheckoutPaymentOption,
  ICheckoutDeliveryOption,
} from 'src/types/checkout';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

import { useCheckoutItems } from 'src/hooks/checkout';

import { sdk } from 'src/lib/medusa';

import { Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { getErrorMessage } from 'src/auth/utils';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutDelivery } from './checkout-delivery';
import { CheckoutBillingInfo } from './checkout-billing-info';
import { CheckoutPaymentMethods } from './checkout-payment-methods';

// ----------------------------------------------------------------------

const DELIVERY_OPTIONS: ICheckoutDeliveryOption[] = [
  // { value: 0, label: 'Free', description: '5-7 days delivery' },
  { value: 0, label: 'Giao hàng nhanh', description: 'Giao hàng trong vòng 3-5 ngày' },
  // { value: 20, label: 'Express', description: '2-3 days delivery' },
];

const PAYMENT_OPTIONS: ICheckoutPaymentOption[] = [
  // {
  //   value: 'paypal',
  //   label: 'Pay with Paypal',
  //   description: 'You will be redirected to PayPal website to complete your purchase securely.',
  // },
  // {
  //   value: 'creditcard',
  //   label: 'Credit / Debit card',
  //   description: 'We support Mastercard, Visa, Discover and Stripe.',
  // },
  { value: 'cash', label: 'Tiền mặt', description: 'Thanh toán bằng tiền mặt khi đơn hàng của bạn được giao.' },
];

const CARD_OPTIONS: ICheckoutCardOption[] = [
  { value: 'visa1', label: '**** **** **** 1212 - Jimmy Holland' },
  { value: 'visa2', label: '**** **** **** 2424 - Shawn Stokes' },
  { value: 'mastercard', label: '**** **** **** 4545 - Cole Armstrong' },
];

// ----------------------------------------------------------------------

export type PaymentSchemaType = zod.infer<typeof PaymentSchema>;

export const PaymentSchema = zod.object({
  payment: zod.string().min(1, { message: 'Payment is required!' }),
  // Not required
  delivery: zod.number(),
});

// ----------------------------------------------------------------------

export function CheckoutPayment() {
  const {
    loading,
    onResetCart,
    onChangeStep,
    onApplyShipping,
    state: checkoutState,
  } = useCheckoutContext();

  const { checkoutItems } = useCheckoutItems(checkoutState)

  const defaultValues: PaymentSchemaType = {
    delivery: 0,
    payment: 'cash',
  };

  const methods = useForm<PaymentSchemaType>({
    resolver: zodResolver(PaymentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { billing } = checkoutState;
      onResetCart();
      const { cart } = await sdk.store.cart.create({
        shipping_address: {
          address_1: billing?.fullAddress,
          last_name: billing?.name,
          country_code: 'vn',
          phone: billing?.phoneNumber,
          city: billing?.city,
          province: billing?.state
        },
        email: billing?.email,
        items: checkoutState.items.map(item => ({
          quantity: item.quantity,
          variant_id: item.variantId,
        })),

      })
      const { payment_providers } = await sdk.store.payment.listPaymentProviders(
        {
          region_id: cart.region_id!
        }
      );

      await sdk.store.payment.initiatePaymentSession(cart, {
        provider_id: payment_providers[0]?.id
      })
      const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id });
      await sdk.store.cart.addShippingMethod(cart.id, {
        option_id: shipping_options[0]?.id
      })
      await sdk.store.cart.complete(cart.id);
      onChangeStep('next');
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CheckoutDelivery
            name="delivery"
            onApplyShipping={onApplyShipping}
            options={DELIVERY_OPTIONS}
          />

          <CheckoutPaymentMethods
            name="payment"
            options={{ cards: CARD_OPTIONS, payments: PAYMENT_OPTIONS }}
            sx={{ my: 3 }}
          />

          <Button
            size="small"
            color="inherit"
            onClick={() => onChangeStep('back')}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Quay lại
          </Button>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CheckoutBillingInfo
            loading={loading}
            onChangeStep={onChangeStep}
            checkoutState={checkoutState}
          />

          <CheckoutSummary checkoutItems={checkoutItems} onEdit={() => onChangeStep('go', 0)} />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Hoàn tất đơn hàng
          </LoadingButton>
        </Grid>
      </Grid>
    </Form>
  );
}
