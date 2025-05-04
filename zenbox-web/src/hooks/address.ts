import type { IAddressItem } from 'src/types/common'

import { useLocalStorage } from 'minimal-shared/hooks'


export const useAddressList = () => {
  const { state, setState, resetState, setField } = useLocalStorage<{ items: IAddressItem[] }>('addressList', { items: [] }, {
    initializeWithValue: false,
  })

  const addAddress = (addData: IAddressItem) => {
    setState({ items: [...state.items, addData] })
  }

  const removeAddress = (removeData: IAddressItem) => {
    setState({ items: state.items.filter(item => item.id !== removeData.id) })
  }
  return {
    addressList: state.items ?? [],
    addAddress,
    removeAddress
  }
}