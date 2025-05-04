import useSWR from 'swr'

import { COMMON_LOGIN_MODAL } from 'src/constants'

export const useLoginModal = () => {
  const { data, mutate } = useSWR<{ show: boolean } | null>(COMMON_LOGIN_MODAL);
  const closeLogin = () => {
    mutate({
      show: false,
    })
  }

  const showLogin = () => {
    mutate({
      show: true,
    })
  }
  return {
    show: !!data?.show,
    closeLogin,
    showLogin,
  }
}