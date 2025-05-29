
import React from 'react'
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, DialogTitle, DialogContent, DialogActions } from '@mui/material'

import { fData } from 'src/utils/format-number';

import axiosInstance from 'src/lib/axios';
import { sdk, sdkConfig } from 'src/lib/medusa';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form'

import { useAuthContext } from 'src/auth/hooks';
import { getErrorMessage } from 'src/auth/utils';
import { DEFAULT_AVATAR } from 'src/auth/context/jwt/constant';

import { useAccountModal } from './action'

type Props = {}

export type UserQuickEditSchemaType = zod.infer<typeof UserQuickEditSchema>;

export const UserQuickEditSchema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  phoneNumber: zod.string().optional(),
  avatarUrl: zod.custom<File | string | null>().optional(),
});
const AccountDialog = (props: Props) => {
  const { show, closeAccountModal } = useAccountModal();
  const defaultValues: UserQuickEditSchemaType = {
    firstName: '',
    email: '',
    lastName: '',
    phoneNumber: ''
  };
  const { user: authUser, checkUserSession, } = useAuthContext();

  const methods = useForm<UserQuickEditSchemaType>({
    mode: 'all',
    resolver: zodResolver(UserQuickEditSchema),
    defaultValues,
    values: {
      firstName: authUser?.first_name ?? '',
      lastName: authUser?.last_name ?? '',
      email: authUser?.email ?? '',
      phoneNumber: authUser?.phone ?? '',
      avatarUrl: authUser?.metadata?.avatarUrl ?? DEFAULT_AVATAR
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {


    try {
      let avatarUrl: string | null = null;
      if (data.avatarUrl && data.avatarUrl instanceof File) {
        const formData = new FormData();
        formData.append('files', data.avatarUrl);
        formData.append('name', 'FILE')
        const res = await axiosInstance.post(`${sdkConfig.baseUrl}/store/custom/upload`, formData)
        console.log({ res })
        const file = res.data?.files?.[0];
        if (file?.url) {
          avatarUrl = file.url;
        }
        // const image = await sdk.store.
      }

      await sdk.store.customer.update({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phoneNumber,
        ...avatarUrl && {
          metadata: {
            avatarUrl
          }
        }

      })

      reset();
      closeAccountModal();
      await checkUserSession?.();
      toast.success('Cập nhật thành công!');

      console.info('DATA', data);
      closeAccountModal();
    } catch (error) {
      toast.error(getErrorMessage(error))
      console.error(error);
    }
  });
  return (
    <Dialog
      fullWidth
      open={show}
      onClose={closeAccountModal}
      maxWidth="xs"
    >
      <DialogTitle>Thông tin tài khoản</DialogTitle>

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
            <Field.UploadAvatar
              name='avatarUrl'
              validator={(fileData) => {
                if (fileData.size > 1000000) {
                  return { code: 'file-too-large', message: `File is larger than ${fData(1000000)}` };
                }
                return null;
              }}
            />

            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <Box
              sx={{
                display: 'flex',
                gap: { xs: 3, sm: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >

              <Field.Text
                name="lastName"
                label="Họ và tên đệm"
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Field.Text
                name="firstName"
                label="Tên"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>

            <Field.Text name="phoneNumber" label="Số điện thoại" slotProps={{ inputLabel: { shrink: true } }} />
            <Field.Text disabled name="email" label="Email" slotProps={{ inputLabel: { shrink: true } }} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={closeAccountModal}>
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

export default AccountDialog