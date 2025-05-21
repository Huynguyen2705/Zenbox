import useSWR from 'swr'

import { COMMON_ACCOUNT_MODAL } from 'src/constants'

export const useAccountModal = () => {
  const { data, mutate } = useSWR<{ show: boolean, onSuccess?(): void } | null>(COMMON_ACCOUNT_MODAL);
  const closeAccountModal = () => {
    mutate({
      show: false,
    })
  }

  const showAccountModal = (onSuccess?: () => void) => {
    mutate({
      show: true,
      onSuccess
    })
  }
  return {
    show: !!data?.show,
    closeAccountModal,
    showAccountModal,
    onSuccess: data?.onSuccess
  }
}