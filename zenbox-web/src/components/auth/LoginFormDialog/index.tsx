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

import { useLoginModal } from './action';
// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
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

export function LoginFormDialog() {
  const showPassword = useBoolean();
  const { show, closeLogin, onSuccess } = useLoginModal();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { checkUserSession } = useAuthContext();
  const defaultValues: SignInSchemaType = {
    email: '',
    password: '',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage(null);
      await sdk.auth.login(
        "customer",
        "emailpass",
        data
      );
      await checkUserSession?.();

      toast.success('Đăng nhập thành công!');
      onSuccess?.();
      closeLogin();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      setErrorMessage(feedbackMessage);
    }
  });

  const renderForm = () => (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <Field.Text name="email" label="Email" slotProps={{ inputLabel: { shrink: true } }} />

      <Box sx={{ gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        {/* <Link
          component={RouterLink}
          href={paths.authDemo.centered.resetPassword}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          Quên mật khẩu?
        </Link> */}

        <Field.Text
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          type={showPassword.value ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end">
                    <Iconify
                      icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Đăng ký..."
      >
        Đăng nhập
      </LoadingButton>
    </Box>
  );

  return (
    <Dialog
      open={show}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
          <Fab color='default' size='small' variant='soft' onClick={closeLogin}>
            <Iconify icon="mingcute:close-line" />
          </Fab>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <AnimateLogoRotate sx={{ mb: 3, mx: 'auto' }} />

        <FormHead
          title="Đăng nhập"
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
    </Dialog>
  );
}
