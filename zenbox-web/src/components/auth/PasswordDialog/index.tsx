import React from 'react'
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material'

import { Form, Field } from 'src/components/hook-form'

import { useAuthContext } from 'src/auth/hooks';

import { usePasswordModal } from './action'

export type ChangePasswordSchemaType = zod.infer<typeof ChangePasswordSchema>;

export const ChangePasswordSchema = zod.object({
  password: zod
    .string()
    .min(1, { message: 'Mật khẩu cũ không được để trống' }),
  newPassword: zod
    .string()
    .min(1, { message: 'Mật khẩu mới  không được để trống' })
    .min(6, { message: 'Mật khẩu phải chứa ít  nhất 6 ký tự' }),
  confirmPassword: zod
    .string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Xác nhận mật khẩu không khớp",
  path: ["confirmPassword"], // This specifies where the error message should appear
});
const PasswordDialog = () => {
  const { show, closePasswordModal } = usePasswordModal();
  const defaultValues: ChangePasswordSchemaType = {
    password: '',
    newPassword: '',
    confirmPassword: '',
  };
  const { checkUserSession } = useAuthContext();


  const methods = useForm<ChangePasswordSchemaType>({
    mode: 'all',
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {

    try {
      reset();
      closePasswordModal();

      // toast.promise(promise, {
      //   loading: 'Loading...',
      //   success: 'Cập nhật thành công!',
      //   error: 'Cập nhật thất bại!',
      // });

      // await promise;

      await checkUserSession?.();


      console.info('DATA', data);
      closePasswordModal();
    } catch (error) {
      console.error(error);
    }
  });
  return (
    <Dialog
      fullWidth
      open={show}
      onClose={closePasswordModal}
      maxWidth="xs"
    >
      <DialogTitle>Đổi mật khẩu</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box
            sx={{
              rowGap: 3,
              columnGap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)' },
            }}
          >

            <Field.Text name="phoneNumber" label="Số điện thoại" slotProps={{ inputLabel: { shrink: true } }} />
            <Field.Text disabled name="email" label="Email" slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={closePasswordModal}>
            Huỷ
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Cập nhật
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  )
}

export default PasswordDialog