'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Fab, Alert, Dialog, DialogTitle, DialogContent } from '@mui/material';

import { sdk } from 'src/lib/medusa';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { AnimateLogoRotate } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';
import { getErrorMessage } from 'src/auth/utils';
import { FormHead } from 'src/auth/components/form-head';

import { useRegisterModal } from './action';

// ----------------------------------------------------------------------

export type SignUpSchemaType = zod.infer<typeof SignUpSchema>;

export const SignUpSchema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required!' }),
  lastName: zod.string().min(1, { message: 'Last name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function RegisterDialog() {
  const showPassword = useBoolean();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultValues: SignUpSchemaType = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  const methods = useForm<SignUpSchemaType>({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const { closeRegister, show } = useRegisterModal();
  const { checkUserSession } = useAuthContext();
  const onSubmit = handleSubmit(async (data) => {
    try {
      const token = await sdk.auth.register(
        "customer",
        "emailpass",
        {
          email: data.email,
          password: data.password
        }
      )
      await sdk.store.customer.create({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email
      })

      await sdk.auth.login('customer', 'emailpass', {
        email: data.email,
        password: data.password
      });
      await checkUserSession?.();
      toast.success('Đăng ký tài khoản thành công!');
      closeRegister();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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

      <Field.Text name="email" label="Email" slotProps={{ inputLabel: { shrink: true } }} />

      <Field.Text
        name="password"
        label="Mật khâu"
        placeholder="6+ ký tự"
        type={showPassword.value ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={showPassword.onToggle} edge="end">
                  <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Đăng ký..."
      >
        Đăng ký
      </LoadingButton>
    </Box>
  );

  return (<Dialog
    open={show}
    fullWidth
    maxWidth="xs"
  >
    <DialogTitle>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
        <Fab color='default' size='small' variant='soft' onClick={closeRegister}>
          <Iconify icon="mingcute:close-line" />
        </Fab>
      </Box>
    </DialogTitle>
    <DialogContent sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <AnimateLogoRotate sx={{ mb: 3, mx: 'auto' }} />

      <FormHead
        title="Đăng ký"
      // description={
      //   <>
      //     {`Bạn chưa có tài khoản? `}
      //     <Link component={RouterLink} href={paths.authDemo.centered.signUp} variant="subtitle2">
      //       Đăng ký
      //     </Link>
      //   </>
      // }
      />
      {!!errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}
      <Box sx={{ width: '100%' }}>
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm()}
        </Form>
      </Box>
    </DialogContent>
  </Dialog>)

}
