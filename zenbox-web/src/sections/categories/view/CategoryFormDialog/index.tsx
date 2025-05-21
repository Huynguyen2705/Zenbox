'use client';

import type { AdminProductCategory } from '@medusajs/types';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import LoadingButton from '@mui/lab/LoadingButton';
import { Dialog, Button, Switch, DialogTitle, DialogContent, DialogActions, FormControlLabel } from '@mui/material';

import { sdk } from 'src/lib/medusa';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import CategoryPicker from 'src/components/CategoryPicker';

import { getErrorMessage } from 'src/auth/utils';


// ----------------------------------------------------------------------

export type CategorySchemaType = zod.infer<typeof CategorySchema>;

export const CategorySchema = zod.object({
  name: zod.string().min(1, { message: 'Tên danh mục không được để trống' }),
  handle: zod.string().min(1, { message: 'Đường dẫn không được để trống' }),
  is_active: zod.boolean(),
  category_parent: zod.object({
    id: zod.string().optional(),
    name: zod.string().optional(),
  }).optional().nullable(),
  rank: zod.number().optional(),

});

// ----------------------------------------------------------------------
export interface CategoryDialogProps {
  show: boolean;
  onClose: () => void;
  onRefresh: () => void;
  data?: AdminProductCategory;
}
export function CategoryFormDialog({ show, onClose, data, onRefresh }: CategoryDialogProps) {

  const defaultValues: CategorySchemaType = {
    name: '',
    handle: '',
    is_active: true,
  };

  const methods = useForm<CategorySchemaType>({
    resolver: zodResolver(CategorySchema),
    defaultValues,
    values: {
      name: data?.name ?? '',
      handle: data?.handle ?? '',
      is_active: !!data?.is_active,
      rank: data?.rank || undefined,
      category_parent: data?.parent_category as any
    }
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  const onSubmit = handleSubmit(async (dataForm) => {
    try {
      const payload = {
        name: dataForm.name,
        handle: dataForm.handle,
        is_active: dataForm.is_active,
        rank: dataForm.rank,
        parent_category_id: dataForm?.category_parent?.id as string | null

      }
      if (data) {
        console.log('Update')
        if (!payload.parent_category_id) {
          payload.parent_category_id = null;
        }
        await sdk.admin.productCategory.update(data.id, payload)
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await sdk.admin.productCategory.create(payload as any)
        toast.success('Thêm danh mục thành công!');

      }
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      const feedbackMessage = getErrorMessage(error);
      toast.error(feedbackMessage);
    }
  });
  const values = methods.watch();
  console.log({ errors })

  const renderForm = () => (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Field.Text
        name="name"
        label="Tên"
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Field.Text name="handle" label="Đường dẫn" />
      <CategoryPicker selected={values.category_parent as any} onChange={(category) => {
        methods.setValue('category_parent', category as any)
      }} label='Danh mục cha' name='category_parent' />
      <Field.Numeric name="rank" label="Thứ tự" />


      <DialogActions>
        <FormControlLabel
          sx={{ mr: 'auto', ml: -2 }}
          label="Hiển thị"
          control={<Switch
            onChange={(_, checked) => {
              methods.setValue('is_active', checked)
            }}
            checked={values.is_active}
            defaultChecked inputProps={{ id: 'publish-switch' }} />}
        />
        <Button variant="outlined" onClick={onClose}>
          Huỷ
        </Button>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {data ? 'Cập nhật' : 'Thêm'}
        </LoadingButton>
      </DialogActions>
    </Box>
  );

  return (<Dialog
    open={show}
    fullWidth
    maxWidth="xs"
  >
    <DialogTitle>{data ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>

    <DialogContent sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      <Box sx={{ width: '100%', mt: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm()}
        </Form>
      </Box>
    </DialogContent>
  </Dialog>)

}
