'use client';

import type { Theme, SxProps } from '@mui/material/styles';
import type { AdminProductCategory } from '@medusajs/types';
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
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useModal } from 'src/hooks/useModal';
import { useDeleteCategory, useGetAdminCategories } from 'src/hooks/category';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CategoryFormDialog } from './view/CategoryFormDialog';
// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

export function CategoryListView() {
  const confirmDialog = useBoolean();
  const deleteModal = useModal<AdminProductCategory>();
  const updateCreateModal = useModal<AdminProductCategory>()

  const { deleteCategory, loadingDeleteCategory } = useDeleteCategory();
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);


  const filters = useSetState<IProductTableFilters>({ publish: [], stock: [] });
  const { state: currentFilters } = filters;
  //get list product
  const limit = 10
  const [currentPage, setCurrentPage] = useState(0)

  const offset = useMemo(() => currentPage * limit, [currentPage])
  const { categories, categoriesLoading, totalCount, refreshCategories } = useGetAdminCategories({ limit, offset });

  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);


  const canReset = currentFilters.publish.length > 0 || currentFilters.stock.length > 0;



  const handleDeleteRow = async () => {
    await deleteCategory({ id: deleteModal.data!.id as string })
    deleteModal.handleHide();
    refreshCategories();
  }

  const handleDeleteRows = () => { }

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        filters={filters}
        canReset={canReset}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={categories.length}
        onOpenConfirmDeleteRows={confirmDialog.onTrue}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFilters, selectedRowIds]
  );

  const columns: GridColDef<AdminProductCategory>[] = [

    {
      field: 'name',
      headerName: 'Tên danh mục',
      flex: 1,
      minWidth: 360,
      hideable: false,

    },
    {
      field: 'parent_category',
      headerName: 'Thư mục cha',
      renderCell(params) {
        return params.row.parent_category?.name ?? ''
      },
      width: 110,
    },
    {
      field: 'handle',
      headerName: 'Đường dẫn',
      width: 110,
    },
    {
      field: 'rank',
      headerName: 'Thứ tự',
      align: 'center',
      headerAlign: 'center',
      width: 110,
    },
    {
      field: 'is_active',
      headerName: 'Trạng thái',
      width: 110,
      renderCell(params) {
        return params.value ? <Label
          variant="soft"
          color="success"
        >
          Hoạt động
        </Label> : <Label
          variant="soft"
          color="error"
        >
          Ẩn
        </Label>
      },
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

        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Chỉnh sửa"
          onClick={() => {
            updateCreateModal.handleShow(params.row)
          }}
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
          Bạn có chắc chắn muốn xoá <strong> {deleteModal.data?.name as string} </strong>?
        </>
      }
      action={
        <LoadingButton
          variant="contained"
          color="error"
          loading={loadingDeleteCategory}
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
          heading="Quản lý danh mục"
          links={[
            { name: 'Trang chủ', href: paths.dashboard.root },
            { name: 'Quản lý danh mục', href: '/dashboard/category' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                updateCreateModal.handleShow();
              }}
            >
              Thêm danh mục
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
            rows={categories}
            columns={columns}
            loading={categoriesLoading}
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
      <CategoryFormDialog onRefresh={refreshCategories} show={updateCreateModal.show} onClose={updateCreateModal.handleHide} data={updateCreateModal.data} />
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
    <GridToolbarContainer>

      <GridToolbarQuickFilter />

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


