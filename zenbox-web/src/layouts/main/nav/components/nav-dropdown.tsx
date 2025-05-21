import type { FadeProps } from '@mui/material/Fade';

import Fade from '@mui/material/Fade';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const NavDropdownPaper = styled('div')(({ theme }) => ({
  ...theme.mixins.paperStyles(theme, { dropdown: true }),
  padding: theme.spacing(5, 1, 1, 4),
  borderRadius: theme.shape.borderRadius * 2,
  ...(theme.direction === 'rtl' && {
    padding: theme.spacing(5, 4, 1, 1),
  }),
}));

// ----------------------------------------------------------------------

type NavDropdownProps = React.ComponentProps<'div'> & {
  open: FadeProps['in'];
};

export const NavDropdown = styled(({ open, children, ...other }: NavDropdownProps) => (
  <Fade in={open}>
    <div {...other}>
      <NavDropdownPaper sx={{ p: 1 }}>{children}</NavDropdownPaper>
    </div>
  </Fade>
))(({ theme }) => ({
  left: -10,
  right: 0,

  width: '100%',
  position: 'absolute',
  padding: 2,
  minWidth: 200,
  zIndex: theme.zIndex.drawer * 2,
  maxWidth: theme.breakpoints.values.lg,
  top: 'calc(var(--layout-header-desktop-height) / 2)',
}));
