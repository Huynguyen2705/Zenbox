import type { IAddressItem } from 'src/types/common';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type NewAddressSchemaType = zod.infer<typeof NewAddressSchema>;

export const NewAddressSchema = zod.object({
  city: zod.string().min(1, { message: 'Tỉnh/Thành phố không được để trống' }),
  state: zod.string().min(1, { message: 'Quận/Huyện không được để trống' }),
  firstName: zod.string().min(1, { message: 'Tên không được để trống' }),
  lastName: zod.string().min(1, { message: 'Họ và tên đệm không được để trống' }),
  address: zod.string().min(1, { message: 'Địa chỉ không được để trống' }),
  phoneNumber: schemaHelper.phoneNumber({ isValid: isValidPhoneNumber }),
  // country: schemaHelper.nullableInput(zod.string().min(1, { message: 'Country is required!' }), {
  //   // message for null value
  //   message: 'Country is required!',
  // }),
  // Not required
  primary: zod.boolean(),
  email: zod.string().optional(),
  // addressType: zod.string(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (address: IAddressItem) => void;
};

export function AddressNewForm({ open, onClose, onCreate }: Props) {
  const defaultValues: NewAddressSchemaType = {
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    address: '',
    primary: false,
    phoneNumber: '',
  };

  const methods = useForm<NewAddressSchemaType>({
    mode: 'all',
    resolver: zodResolver(NewAddressSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      onCreate({
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        phoneNumber: data.phoneNumber,
        city: data.city,
        state: data.state,
        email: data.email,
        fullAddress: `${data.address}, ${data.city}, ${data.state}`,
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Thêm địa chỉ</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                pt: 2,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="firstName" label="Tên" />
              <Field.Text name="lastName" label="Họ và tên đệm" />
              <Field.Text name="email" label="Địa chỉ email" />

              <Field.Phone disableSelect name="phoneNumber" label="Số điện thoại" country="VN" />
            </Box>

            <Field.Text name="address" label="Địa chỉ" />

            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="city" label="Tỉnh/Thành phố" />

              <Field.Text name="state" label="Quận/Huyện" />
            </Box>

            {/* <Field.CountrySelect name="country" label="Country" placeholder="Choose a country" /> */}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            Hủy
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Lưu
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
