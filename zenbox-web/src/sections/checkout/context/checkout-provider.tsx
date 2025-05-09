'use client';

import type { IAddressItem } from 'src/types/common';
import type { ICheckoutItem, ICheckoutState } from 'src/types/checkout';

import { isEqual } from 'es-toolkit';
import { getStorage } from 'minimal-shared/utils';
import { useLocalStorage } from 'minimal-shared/hooks';
import { useMemo, useState, Suspense, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from 'src/auth/hooks';

import { CheckoutContext } from './checkout-context';

// ----------------------------------------------------------------------

const CHECKOUT_STORAGE_KEY = 'app-checkout';
const CHECKOUT_STEPS = ['Giỏ hàng', 'Địa chỉ', 'Thanh toán'];

const initialState: ICheckoutState = {
  items: [],
  subtotal: 0,
  total: 0,
  discount: 0,
  shipping: 0,
  billing: null,
  totalItems: 0,
};

// ----------------------------------------------------------------------

type CheckoutProviderProps = {
  children: React.ReactNode;
};

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  return (
    <Suspense fallback={<SplashScreen />}>
      <CheckoutContainer>{children}</CheckoutContainer>
    </Suspense>
  );
}

// ----------------------------------------------------------------------

function CheckoutContainer({ children }: CheckoutProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeStep = pathname.includes(paths.product.checkout)
    ? Number(searchParams.get('step'))
    : null;

  const { authenticated } = useAuthContext();

  const [loading, setLoading] = useState(true);

  const { state, setState, setField, resetState } = useLocalStorage<ICheckoutState>(
    CHECKOUT_STORAGE_KEY,
    initialState,
    { initializeWithValue: false }
  );

  const canReset = !isEqual(state, initialState);
  const completed = activeStep === CHECKOUT_STEPS.length;

  const updateTotals = useCallback(() => {
    const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
    // const subtotal = state.items.reduce((total, item) => total + item.quantity * item.price, 0);

    // setField('subtotal', subtotal);
    setField('totalItems', totalItems);
    // setField('total', subtotal - state.discount + state.shipping);
  }, [setField, state.discount, state.items, state.shipping]);

  useEffect(() => {
    const initializeCheckout = async () => {
      try {
        setLoading(true);
        const restoredValue = getStorage(CHECKOUT_STORAGE_KEY);
        if (restoredValue) {
          updateTotals();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [updateTotals]);

  const onChangeStep = useCallback(
    (type: 'back' | 'next' | 'go', step?: number) => {
      const stepNumbers = {
        back: (activeStep ?? 0) - 1,
        next: (activeStep ?? 0) + 1,
        go: step ?? 0,
      };

      const targetStep = stepNumbers[type];
      const queryString = new URLSearchParams({ step: `${targetStep}` }).toString();
      const redirectPath =
        targetStep === 0 ? paths.product.checkout : `${paths.product.checkout}?${queryString}`;

      router.push(redirectPath);
    },
    [activeStep, router]
  );

  const onAddToCart = useCallback(
    async (newItem: ICheckoutItem) => {

      const updatedItems = state.items.map((item) => {
        if (item.variantId === newItem.variantId) {
          return {
            ...item,
            quantity: item.quantity + newItem.quantity,
          };
        }
        return item;
      });

      if (!updatedItems.some((item) => item.variantId === newItem.variantId)) {
        updatedItems.push(newItem);
      }

      setField('items', updatedItems);
      toast.success('Sản phẩm đã được thêm vào giỏ hàng!')
    },
    [setField, state.items]
  );

  const onDeleteCartItem = useCallback(
    (variantId: string) => {
      const updatedItems = state.items.filter((item) => item.variantId !== variantId);

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onChangeItemQuantity = useCallback(
    (variantId: string, quantity: number) => {
      const updatedItems = state.items.map((item) => {
        if (item.variantId === variantId) {
          return { ...item, quantity };
        }
        return item;
      });

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onCreateBillingAddress = useCallback(
    (address: IAddressItem) => {
      setField('billing', address);
    },
    [setField]
  );

  const onApplyDiscount = useCallback(
    (discount: number) => {
      setField('discount', discount);
    },
    [setField]
  );

  const onApplyShipping = useCallback(
    (shipping: number) => {
      setField('shipping', shipping);
    },
    [setField]
  );

  const onResetCart = useCallback(() => {
    if (completed) {
      resetState(initialState);
    }
  }, [completed, resetState]);

  const memoizedValue = useMemo(
    () => ({
      state,
      setState,
      setField,
      /********/
      activeStep,
      onChangeStep,
      steps: CHECKOUT_STEPS,
      /********/
      canReset,
      loading,
      completed,
      /********/
      onAddToCart,
      onResetCart,
      onApplyDiscount,
      onApplyShipping,
      onDeleteCartItem,
      onChangeItemQuantity,
      onCreateBillingAddress,
    }),
    [
      state,
      loading,
      canReset,
      setField,
      setState,
      completed,
      activeStep,
      onResetCart,
      onAddToCart,
      onChangeStep,
      onApplyDiscount,
      onApplyShipping,
      onDeleteCartItem,
      onChangeItemQuantity,
      onCreateBillingAddress,
    ]
  );

  return <CheckoutContext.Provider value={memoizedValue}>{children}</CheckoutContext.Provider>;
}
