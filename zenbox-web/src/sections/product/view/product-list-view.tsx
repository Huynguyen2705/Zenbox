'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'minimal-shared/hooks';
import type { IProductTableFilters } from 'src/types/product';
import type {
  GridColDef,
  GridSlotProps,
  GridRowSelectionModel,
  GridActionsCellItemProps,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import { useBoolean, useSetState } from 'minimal-shared/hooks';
import { useMemo, useState, forwardRef, useCallback } from "react"

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  DataGrid,
  gridClasses,
  GridActionsCellItem,
  GridToolbarContainer,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useModal } from 'src/hooks/useModal';
import { useDeleteProduct, useGetAdminProducts } from 'src/hooks/product';

import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductTableToolbar } from '../product-table-toolbar';
import { ProductTableFiltersResult } from '../product-table-filters-result';
import {
  RenderCellPublish,
  RenderCellProduct,
} from '../product-table-row';
// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export function ProductListView() {
  const confirmDialog = useBoolean();
  const deleteModal = useModal();

  const { deleteProduct, loadingDeleteProduct } = useDeleteProduct();
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);

  const filters = useSetState<IProductTableFilters>({ publish: [], stock: [] });
  const { state: currentFilters } = filters;
  //get list product
  const limit = 10
  const [currentPage, setCurrentPage] = useState(0)

  const offset = useMemo(() => currentPage * limit, [currentPage])
  const { products, productsLoading, totalCount, refreshProducts } = useGetAdminProducts({ limit, offset });

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);


  const canReset = currentFilters.publish.length > 0 || currentFilters.stock.length > 0;



  const handleDeleteRow = async () => {
    await deleteProduct({ id: deleteModal.data!.id as string })
    deleteModal.handleHide();
    refreshProducts();
  }

  const handleDeleteRows = () => { }

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        filters={filters}
        canReset={canReset}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={products.length}
        onOpenConfirmDeleteRows={confirmDialog.onTrue}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFilters, selectedRowIds]
  );

  const columns: GridColDef[] = [

    {
      field: 'title',
      headerName: 'Sản phẩm',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => (

        <RenderCellProduct params={params} href={paths.dashboard.product.details(params.row.id)} />
      ),
    },
    {
      field: 'status',
      headerName: 'Publish',
      width: 110,
      type: 'singleSelect',
      editable: true,
      valueOptions: PUBLISH_OPTIONS,
      renderCell: (params) => <RenderCellPublish params={params} />,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsLinkItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="Chi tiết"
          href={paths.dashboard.product.details(params.row.id)}
        />,
        <GridActionsLinkItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Chỉnh sửa"
          href={paths.dashboard.product.edit(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Xoá"
          onClick={() => deleteModal.handleShow(params.row)}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={deleteModal.show}
      onClose={deleteModal.handleHide}
      title="Xoá"
      content={
        <>
          Bạn có chắc chắn muốn xoá <strong> {deleteModal.data?.title as string} </strong>?
        </>
      }
      action={
        <LoadingButton
          variant="contained"
          color="error"
          loading={loadingDeleteProduct}
          onClick={() => {
            handleDeleteRow();
          }}
        >
          Xoá
        </LoadingButton>
      }
    />
  );

  const renderDeleteConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Xoá"
      content={
        <>
          Bạn có chắc chắn muốn xoá <strong> {selectedRowIds.length} </strong> sản phẩm?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          xoá
        </Button>
      }
    />
  );



  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Danh sách sản phẩm"
          links={[
            { name: 'Trang chủ', href: paths.dashboard.root },
            { name: 'Danh sách sản phẩm', href: paths.dashboard.product.root },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Thêm sản phẩm
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            minHeight: 640,
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            height: { xs: 800, md: '1px' },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            // checkboxSelection
            disableRowSelectionOnClick
            rows={products}
            columns={columns}
            loading={productsLoading}
            getRowHeight={() => 'auto'}
            paginationMode="server"
            rowCount={totalCount}
            paginationModel={{ pageSize: limit, page: currentPage }}
            onPaginationModelChange={(model) => {
              setCurrentPage(model.page);
            }}
            // pageSizeOptions={[5, 10, 20, { value: -1, label: 'All' }]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: CustomToolbarCallback,
              noRowsOverlay: () => <EmptyContent />,
              noResultsOverlay: () => <EmptyContent title="Không tìm thấy sản phẩm" />,
            }}
            slotProps={{
              toolbar: { setFilterButtonEl },
              panel: { anchorEl: filterButtonEl },
              columnsManagement: { getTogglableColumns },
            }}
            sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
      {renderDeleteConfirmDialog()}
    </>
  );
}

// ----------------------------------------------------------------------

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setFilterButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
  }
}

type CustomToolbarProps = GridSlotProps['toolbar'] & {
  canReset: boolean;
  filteredResults: number;
  selectedRowIds: GridRowSelectionModel;
  filters: UseSetStateReturn<IProductTableFilters>;

  onOpenConfirmDeleteRows: () => void;
};

function CustomToolbar({
  filters,
  canReset,
  selectedRowIds,
  filteredResults,
  setFilterButtonEl,
  onOpenConfirmDeleteRows,
}: CustomToolbarProps) {
  return (
    <>
      <GridToolbarContainer>
        <ProductTableToolbar
          filters={filters}
          options={{ stocks: PRODUCT_STOCK_OPTIONS, publishs: PUBLISH_OPTIONS }}
        />

        {/* <GridToolbarQuickFilter /> */}

        <Box
          sx={{
            gap: 1,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          {!!selectedRowIds.length && (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onOpenConfirmDeleteRows}
            >
              Xóa ({selectedRowIds.length})
            </Button>
          )}

          {/* <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} />
          <GridToolbarExport /> */}
        </Box>
      </GridToolbarContainer>

      {canReset && (
        <ProductTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

type GridActionsLinkItemProps = Pick<GridActionsCellItemProps, 'icon' | 'label' | 'showInMenu'> & {
  href: string;
  sx?: SxProps<Theme>;
};

export const GridActionsLinkItem = forwardRef<HTMLLIElement, GridActionsLinkItemProps>(
  (props, ref) => {
    const { href, label, icon, sx } = props;

    return (
      <MenuItem ref={ref} sx={sx}>
        <Link
          component={RouterLink}
          href={href}
          underline="none"
          color="inherit"
          sx={{ width: 1, display: 'flex', alignItems: 'center' }}
        >
          {icon && <ListItemIcon>{icon}</ListItemIcon>}
          {label}
        </Link>
      </MenuItem>
    );
  }
);


