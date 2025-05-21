
import type { AdminOrder, StoreOrder } from '@medusajs/types';

import { useBoolean, usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import ListItemText from '@mui/material/ListItemText';

import { useCancelOrder, useCompleteOrder } from 'src/hooks/orders';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: AdminOrder | StoreOrder;
  detailsHref: string;
  onRefresh: () => void;
};

export function OrderTableRow({ row, onRefresh, detailsHref }: Props) {
  const confirmDialog = useBoolean();
  const completeDialog = useBoolean();
  const { cancelOrder, loadingCancelOrder } = useCancelOrder();
  const { completeOrder, loadingCompleteOrder } = useCompleteOrder();
  const menuActions = usePopover();
  const collapseRow = useBoolean();

  const renderPrimaryRow = () => (
    <TableRow hover >


      <TableCell>
        <ListItemText
          primary={fDate(row.created_at)}
          secondary={fTime(row.created_at)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{ mt: 0.5, component: 'span', typography: 'caption' }}
        />
      </TableCell>

      <TableCell align="right"> {fCurrency(row.total)} </TableCell>

      <TableCell>
        <Tooltip content={row.shipping_address?.address_1} title={row.shipping_address?.address_1}>
          <ListItemText
            primary={'Sđt: ' + (row.shipping_address?.phone ?? '--')}
            secondary={'D/c: ' + (row.shipping_address?.address_1 ?? '--')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
              sx(theme) {
                return {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  WebkitLineClamp: 1,
                  whiteSpace: 'nowrap',
                  maxWidth: '350px',
                };
              },
            }}
          />
        </Tooltip>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (row.status === 'completed' && 'success') ||
            (row.status === 'pending' && 'warning') ||
            (row.status === 'cancelled' && 'error') ||
            'default'
          }
        >
          {row.status}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapseRow.value ? 'inherit' : 'default'}
          onClick={collapseRow.onToggle}
          sx={{ ...(collapseRow.value && { bgcolor: 'action.hover' }) }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        <IconButton color={menuActions.open ? 'inherit' : 'default'} onClick={menuActions.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondaryRow = () => (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapseRow.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5 }}>
            {row.items?.map((item) => (
              <Box
                key={item.id}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  p: theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: `solid 2px ${theme.vars.palette.background.neutral}`,
                  },
                })}
              >
                <Avatar
                  src={item.thumbnail ?? ''}
                  variant="rounded"
                  sx={{ width: 48, height: 48, mr: 2 }}
                />

                <ListItemText
                  primary={item.title}
                  secondary={item.subtitle}
                  primaryTypographyProps={{ typography: 'body2' }}
                  secondaryTypographyProps={{ component: 'span', color: 'text.disabled', mt: 0.5 }}
                />

                <div>x{item.quantity} </div>

                <Box sx={{ width: 110, textAlign: 'right' }}>{fCurrency(item.unit_price)}</Box>
              </Box>
            ))}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'right-top' } }}
    >
      <MenuList>
        <MenuItem
          onClick={() => {
            confirmDialog.onTrue();
            menuActions.onClose();
          }}
          disabled={row.fulfillment_status === 'delivered' || row.status !== 'pending'}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Huỷ đơn hàng
        </MenuItem>

        <li>
          <MenuItem onClick={() => {
            completeDialog.onTrue();
            menuActions.onClose();
          }}
            disabled={row.status !== 'pending'}
            sx={{ color: 'error.success' }}

          >
            <Iconify icon="solar:eye-bold" />
            Hoàn thành đơn hàng
          </MenuItem>
        </li>
      </MenuList>
    </CustomPopover>
  );

  const renderConfrimDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Huỷ đơn hàng"
      content="Bạn có chắc chắn muốn huỷ đơn hàng này không?"
      action={
        <LoadingButton loading={loadingCancelOrder} variant="contained" color="error" onClick={async () => {
          try {
            await cancelOrder({ id: row.id });
            confirmDialog.onFalse();
            onRefresh();
          } catch (error) {
            console.log(error);
          }
        }}>
          Huỷ đơn
        </LoadingButton>
      }
    />
  );

  const renderCompleteDialog = () => (
    <ConfirmDialog
      open={completeDialog.value}
      onClose={completeDialog.onFalse}
      title="Hoàn thành đơn hàng"
      content="Bạn có chắc chắn muốn hoàn thành đơn hàng này không?"
      action={
        <LoadingButton loading={loadingCancelOrder} variant="contained" color="success" onClick={async () => {
          try {
            await completeOrder({ id: row.id });
            completeDialog.onFalse();
            onRefresh();
          } catch (error) {
            console.log(error);
          }
        }}>
          Hoàn thành
        </LoadingButton>
      }
    />
  );

  return (
    <>
      {renderPrimaryRow()}
      {renderSecondaryRow()}
      {renderMenuActions()}
      {renderConfrimDialog()}
      {renderCompleteDialog()}
    </>
  );
}
