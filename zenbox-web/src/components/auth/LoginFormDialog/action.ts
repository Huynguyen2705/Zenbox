import useSWR from 'swr'

import { COMMON_LOGIN_MODAL } from 'src/constants'

export const useLoginModal = () => {
  const { data, mutate } = useSWR<{ show: boolean, onSuccess?(): void } | null>(COMMON_LOGIN_MODAL);
  const closeLogin = () => {
    mutate({
      show: false,
    })
  }

  const showLogin = (onSuccess?: () => void) => {
    mutate({
      show: true,
      onSuccess
    })
  }
  return {
    show: !!data?.show,
    closeLogin,
    showLogin,
    onSuccess: data?.onSuccess
  }
}