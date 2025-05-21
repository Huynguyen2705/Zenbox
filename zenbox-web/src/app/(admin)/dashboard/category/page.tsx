import type { Metadata } from 'next';

import { CategoryListView } from 'src/sections/categories';


// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Quản lý danh mục` };

export default function Page() {
  return <CategoryListView />;
}
