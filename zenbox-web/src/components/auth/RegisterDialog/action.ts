import useSWR from 'swr'

import { COMMON_REGISTER_MODAL } from 'src/constants'

export const useRegisterModal = () => {
  const { data, mutate } = useSWR<{ show: boolean } | null>(COMMON_REGISTER_MODAL);
  const closeRegister = () => {
    mutate({
      show: false,
    })
  }

  const showRegister = () => {
    mutate({
      show: true,
    })
  }
  return {
    show: !!data?.show,
    closeRegister,
    showRegister,
  }
}