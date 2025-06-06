import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { CheckoutView } from 'src/sections/checkout/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Thanh toán - ${CONFIG.appName}` };

export default function Page() {
  return <CheckoutView />;
}
