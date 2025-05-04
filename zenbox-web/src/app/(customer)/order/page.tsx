'use client'

import type { IOrderTableFilters } from 'src/types/order'
import type { TableHeadCellProps } from 'src/components/table';

import useSWR from 'swr'
import { toast } from 'sonner';
import React, { useRef } from 'react'
import { useSetState } from 'minimal-shared/hooks'

import { Box, Card, Table, Container, TableBody, Typography } from '@mui/material'

import { sdk } from 'src/lib/medusa'

import { Scrollbar } from 'src/components/scrollbar'
import { EmptyContent } from 'src/components/empty-content'
import { useTable, TableNoData, TableHeadCustom, TablePaginationCustom } from 'src/components/table'

import { OrderTableRow } from 'src/sections/order/order-table-row';

import { getErrorMessage } from 'src/auth/utils';


type Props = {}

const OrderPager = (props: Props) => {
  const table = useTable();
  const TABLE_HEAD: TableHeadCellProps[] = [
    { id: 'createdAt', label: 'Thời gian', width: 140 },
    // { id: 'totalQuantity', label: 'Sản phẩm', width: 120, align: 'center' },
    { id: 'totalAmount', label: 'Tổng tiền', width: 140, align: 'right' },
    { id: 'address', label: 'Địa chỉ', width: 140 },
    { id: 'status', label: 'Trạng thái', width: 110 },
    { id: '', width: 88 },
  ];

  const filters = useSetState<IOrderTableFilters>({
    name: '',
    // types: [],
    startDate: null,
    endDate: null,
    // type: 'ORDER',
    // status: [],
  });
  const filterRef = useRef<IOrderTableFilters>();

  const { data: orders } = useSWR('order', async () => {
    const res = await sdk.store.order.list({
      fields: '+shipping_address.address_1,+shipping_address.phone'
    });
    return res.orders;
  })
  console.log({ orders })
  const renderNotFound = () => <EmptyContent filled sx={{ py: 10 }} />;

  return (
    <Container sx={{ mb: 15 }}>

      <Typography variant="h4" sx={{ my: { xs: 3, md: 5 } }}>
        Đơn hàng
      </Typography>



      <Card>


        {/* <OrderTableToolbar
                  filters={filters}
                  onResetPage={table.onResetPage}
                  dateError={dateError}
                /> */}

        {/* {canReset && (
                  <OrderTableFiltersResult
                    filters={filters}
                    totalResults={dataFiltered.length}
                    onResetPage={table.onResetPage}
                    sx={{ p: 2.5, pt: 0 }}
                  />
                )} */}

        <Box sx={{ position: 'relative' }}>
          <Scrollbar sx={{ minHeight: 444 }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headCells={TABLE_HEAD}
                rowCount={orders?.length ?? 0}

              />

              <TableBody>
                {orders?.slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                  .map((row) => (
                    <OrderTableRow
                      key={row.id}
                      row={row}
                      selected={false} detailsHref="" onSelectRow={function (): void {
                        throw new Error('Function not implemented.');
                      }} onDeleteRow={async () => {
                        try {
                          await sdk.store.order.cancelTransfer(row.id);
                          toast.success('Huỷ đơn hàng thành công');
                        } catch (error) {
                          toast.error(getErrorMessage(error))
                        }
                      }}                    // selected={table.selected.includes(row.id)}
                    // onSelectRow={() => table.onSelectRow(row.id)}
                    // onDeleteRow={() => handleDeleteRow(row.id)}
                    // detailsHref={paths.dashboard.order.details(row.id)}
                    />
                  ))}



                <TableNoData notFound={!orders?.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={orders?.length ?? 0}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </Container>
  )
}

export default OrderPager