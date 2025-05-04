import type { ICheckoutViewItem, CheckoutContextValue } from 'src/types/checkout';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { NumberInput } from 'src/components/number-input';

// ----------------------------------------------------------------------

type Props = {
  row: ICheckoutViewItem;
  onDeleteCartItem: CheckoutContextValue['onDeleteCartItem'];
  onChangeItemQuantity: CheckoutContextValue['onChangeItemQuantity'];
};

export function CheckoutCartProduct({ row, onDeleteCartItem, onChangeItemQuantity }: Props) {
  return (
    <TableRow>
      <TableCell>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            alt={row.product?.title}
            src={row.product?.thumbnail ?? ''}
            sx={{ width: 64, height: 64 }}
          />

          <Stack spacing={0.5}>
            <Typography noWrap variant="subtitle2" sx={{ maxWidth: 240 }}>
              {row.product?.title}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                typography: 'body2',
                alignItems: 'center',
                color: 'text.secondary',
              }}
            >
              {row.title}
            </Box>
          </Stack>
        </Box>
      </TableCell>

      <TableCell>{fCurrency(row.calculated_price?.calculated_amount)}</TableCell>

      <TableCell>
        <Box sx={{ width: 100, textAlign: 'right' }}>
          <NumberInput
            hideDivider
            value={row.quantity}
            onChange={(event, quantity: number) => onChangeItemQuantity(row.id, quantity)}
            max={row.inventory_quantity}
          />

          {row.inventory_quantity && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Còn lại: {row.inventory_quantity}
          </Typography>}
        </Box>
      </TableCell>

      <TableCell align="right">{fCurrency((row.calculated_price?.calculated_amount || 0) * row.quantity)}</TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        <IconButton onClick={() => onDeleteCartItem(row.id)}>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
