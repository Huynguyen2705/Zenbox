import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

import { useRegisterModal } from 'src/components/auth/RegisterDialog/action';


// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }: ButtonProps) {
  const { showRegister } = useRegisterModal();
  return (
    <Button
      variant="outlined"
      sx={sx}
      onClick={showRegister}
      {...other}
    >
      Đăng ký
    </Button>
  );
}
