import type { TableHeadCellProps } from 'src/components/table';
import type { ICheckoutViewItem, CheckoutContextValue } from 'src/types/checkout';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

import { CheckoutCartProduct } from './checkout-cart-product';

// ----------------------------------------------------------------------

const TABLE_HEAD: TableHeadCellProps[] = [
  { id: 'product', label: 'Sản phẩm' },
  { id: 'price', label: 'Giá' },
  { id: 'quantity', label: 'Số lượng' },
  { id: 'totalAmount', label: 'Thành tiền', align: 'right' },
  { id: '' },
];

// ----------------------------------------------------------------------

type Props = {
  checkoutItems: ICheckoutViewItem[];
  onDeleteCartItem: CheckoutContextValue['onDeleteCartItem'];
  onChangeItemQuantity: CheckoutContextValue['onChangeItemQuantity'];
};

export function CheckoutCartProductList({
  checkoutItems,
  onDeleteCartItem,
  onChangeItemQuantity,
}: Props) {
  return (
    <Scrollbar>
      <Table sx={{ minWidth: 720 }}>
        <TableHeadCustom headCells={TABLE_HEAD} />

        <TableBody>
          {checkoutItems.map((row) => (
            <CheckoutCartProduct
              key={row.id}
              row={row}
              onDeleteCartItem={onDeleteCartItem}
              onChangeItemQuantity={onChangeItemQuantity}
            />
          ))}
        </TableBody>
      </Table>
    </Scrollbar>
  );
}
