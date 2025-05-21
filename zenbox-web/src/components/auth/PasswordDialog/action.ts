import useSWR from 'swr'

import { COMMON_PASSWORD_MODAL } from 'src/constants'

export const usePasswordModal = () => {
  const { data, mutate } = useSWR<{ show: boolean, onSuccess?(): void } | null>(COMMON_PASSWORD_MODAL);
  const closePasswordModal = () => {
    mutate({
      show: false,
    })
  }

  const showPasswordModal = (onSuccess?: () => void) => {
    mutate({
      show: true,
      onSuccess
    })
  }
  return {
    show: !!data?.show,
    closePasswordModal,
    showPasswordModal,
    onSuccess: data?.onSuccess
  }
}