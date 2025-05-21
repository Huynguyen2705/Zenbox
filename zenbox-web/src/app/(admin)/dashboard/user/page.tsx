import type { Metadata } from 'next';

import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Quản lý người dùng` };

export default function Page() {
  return <UserListView />;
}
