'use client';

import type { OrderStatus } from '@medusajs/types';
import type { IOrderTableFilters } from 'src/types/order';
import type { TableHeadCellProps } from 'src/components/table';

import useSWR from 'swr';
import { useMemo, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { fIsAfter } from 'src/utils/format-time';

import { sdk } from 'src/lib/medusa';
import { ORDER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';

import { OrderTableRow } from '../order-table-row';
import { OrderTableToolbar } from '../order-table-toolbar';
import { OrderTableFiltersResult } from '../order-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...ORDER_STATUS_OPTIONS];

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'createdAt', label: 'Thời gian', width: 140 },
  // { id: 'totalQuantity', label: 'Sản phẩm', width: 120, align: 'center' },
  { id: 'totalAmount', label: 'Tổng tiền', width: 140, align: 'right' },
  { id: 'address', label: 'Địa chỉ', width: 140 },
  { id: 'status', label: 'Trạng thái', width: 110 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function OrderListView() {
  const table = useTable({ defaultOrderBy: 'orderNumber' });
  const limit = table.rowsPerPage;
  const currentPage = table.page
  const offset = useMemo(() => currentPage * limit, [currentPage])
  const filters = useSetState<IOrderTableFilters>({
    name: '',
    status: 'all',
    startDate: null,
    endDate: null,
  });
  const { state: currentFilters, setState: updateFilters } = filters;
  const { data: orderRequest, mutate } = useSWR(['admin/order', limit, offset, currentFilters.status, currentFilters.startDate && currentFilters.endDate ? `${currentFilters.endDate.toISOString()}${currentFilters.startDate.toISOString()}` : null,], async () => {
    const res = await sdk.admin.order.list({
      fields: '+shipping_address.address_1,+shipping_address.phone',
      limit, offset,
      ...currentFilters.status !== 'all' && {
        status: currentFilters.status as OrderStatus
      },
      ...currentFilters.startDate && currentFilters.endDate && {
        created_at: {
          $gte: currentFilters.startDate.startOf('day').toISOString(),
          $lte: currentFilters.endDate.endOf('day').toISOString()
        }
      }
    });
    return res;
  })

  const { orders, count } = orderRequest ?? {};

  const confirmDialog = useBoolean();
  const completeDialog = useBoolean();



  const dateError = fIsAfter(currentFilters.startDate, currentFilters.endDate);

  const canReset =
    !!currentFilters.name ||
    currentFilters.status !== 'all' ||
    (!!currentFilters.startDate && !!currentFilters.endDate);

  const notFound = (!orders?.length && canReset) || !orders?.length;

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const renderDeleteDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  const renderCompleteDialog = () => (
    <ConfirmDialog
      open={completeDialog.value}
      onClose={completeDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            completeDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Quản lý đơn hàng"
          links={[
            { name: 'Trang chủ', href: paths.dashboard.root },
            { name: 'Quản lý đơn hàng', href: paths.dashboard.order.root }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: 2.5,
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            dateError={dateError}
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              totalResults={count ?? 0}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>

            <Scrollbar sx={{ minHeight: 444 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headCells={TABLE_HEAD}
                  rowCount={count}
                  numSelected={table.selected.length}
                  onSort={table.onSort}

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
                        onRefresh={() => {
                          mutate();
                        }}
                        detailsHref={paths.dashboard.order.details(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, orders?.length || 0)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={count ?? 0}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {renderDeleteDialog()}
      {renderCompleteDialog()}
    </>
  );
}
