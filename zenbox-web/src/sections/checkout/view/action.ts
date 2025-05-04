import useSWR from 'swr'

export const useVariants = (variantIds: string[]) => {
  const { data } = useSWR(variantIds, async (keys) => {
    // const res = await productModuleService
  })
}