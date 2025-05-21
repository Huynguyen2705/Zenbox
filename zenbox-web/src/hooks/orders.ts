import useMutation from 'swr/mutation'

import { sdk } from 'src/lib/medusa';

import { toast } from 'src/components/snackbar';

export const useCancelOrder = () => {
  const { trigger, isMutating } = useMutation('/cancel/orders', async (key, options: { arg: { id: string } }) => {
    const res = await sdk.admin.order.cancel(options.arg.id);
    return res;
  }, {
    onSuccess(data, key, config) {
      toast.success('Huỷ đơn hàng thành công');
    },
    onError(err, key, config) {
      toast.error('Huỷ đơn hàng thất bại')
    },
  })

  return {
    cancelOrder: trigger,
    loadingCancelOrder: isMutating,
  }
}



export const useCompleteOrder = () => {
  const { trigger, isMutating } = useMutation('/complete/orders', async (key, options: { arg: { id: string } }) => {
    const res = await sdk.client.fetch('/admin/order/completed', {
      body: { orderIds: [options.arg.id] },
      method: 'post',

    })
    return res;
  }, {
    onSuccess(data, key, config) {
      toast.success('Cập nhật đơn hàng thành công');
    },
    onError(err, key, config) {
      toast.error('Cập nhật đơn hàng thất bại')
    },
  })

  return {
    completeOrder: trigger,
    loadingCompleteOrder: isMutating,
  }
}
