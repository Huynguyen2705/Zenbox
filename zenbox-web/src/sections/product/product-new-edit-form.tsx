
import type { StoreProduct, AdminFileListResponse } from '@medusajs/types';

import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { Chip, Button, IconButton } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useCategories } from 'src/hooks/common';

import { sdk } from 'src/lib/medusa';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type NewProductSchemaType = zod.infer<typeof NewProductSchema>;

export const NewProductSchema = zod.object({
  title: zod.string().min(1, { message: 'Tên sản phẩm không được để trống' }),
  description: schemaHelper
    .editor({ message: 'Mô tả không được để trống!' }),
  images: schemaHelper.files({ message: 'Images is required!' }),

  // Not required
  subtitle: zod.string(),
  status: zod.string().optional(),
  categories: zod.array(zod.string()),
  options: zod.array(zod.object({
    title: zod.string(),
    values: zod.array(zod.string()),
  })),
  variants: zod.array(zod.object({
    title: zod.string(),
    manage_inventory: zod.boolean().optional(),
    prices: zod.array(zod.object({
      currency_code: zod.string(),
      amount: zod.number(),
    })).optional(),
    options: zod.any().optional(),
  }))
});

// ----------------------------------------------------------------------

type Props = {
  currentProduct?: StoreProduct;
};

export function ProductNewEditForm({ currentProduct }: Props) {
  const router = useRouter();
  const { categories } = useCategories(true);

  const [includeTaxes, setIncludeTaxes] = useState(false);


  const defaultValues: NewProductSchemaType = {
    title: '',
    description: '',
    subtitle: '',
    images: [],
    categories: [],
    options: [
      {
        title: '',
        values: []
      }
    ],
    variants: []
  };

  const methods = useForm<NewProductSchemaType>({
    resolver: zodResolver(NewProductSchema),
    defaultValues,
    values: currentProduct && {
      title: currentProduct.title!,
      description: currentProduct.description!,
      images: currentProduct.images?.map(item => item.url) ?? [],
      subtitle: currentProduct.subtitle!,
      categories: currentProduct.categories?.map(item => item.id) ?? [],
      options: currentProduct.options?.map(item => ({
        ...item,
        values: item.values?.map(value => value.value) ?? []
      })) ?? [],
      variants: currentProduct.variants?.map(variant => ({
        ...variant,
        title: variant.title ?? '',
        manage_inventory: !!variant.manage_inventory
      })) ?? [],
      status: currentProduct.status ?? 'draft'
    },
  });

  const generateVariants = (options: { title: string; values: string[] }[]) => {
    if (options.length === 0) return [];

    const optionsVariant = options.reduce((acc, option) => {
      const { title, values } = option;
      if (acc.length === 0) {
        return values.map((value) => ({ [title]: value }));
      }
      return acc.flatMap((variant) =>
        values.map((value) => ({
          ...variant,
          [title]: value,
        }))
      );
    }, [] as Record<string, string>[]);
    console.log({ optionsVariant, options })
    return optionsVariant.map((item) => ({
      options: item,
      title: Object.entries(item).map(option => option[1]).join(', '),
      manage_inventory: false,
      prices: [{
        currency_code: 'vnd',
        amount: 0,
      }],

    }))
  }

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",

  });
  const values = watch();
  useEffect(() => {
    handleChangeOptions();
  }, [values.options])

  const handleChangeOptions = () => {
    const newVariants = generateVariants(values.options).map((item, idx) => ({
      ...item, prices: [{
        amount: values.variants[idx]?.prices?.[0]?.amount ?? 0,
        currency_code: values.variants[idx]?.prices?.[0]?.currency_code ?? 'vnd',
      }]
    }));

    console.log({ options: values.options, newVariants, })
    methods.setValue('variants', newVariants);
  }


  const onSubmit = handleSubmit(async (data) => {
    const updatedData = {
      ...data,
    };



    try {
      const shippingProfile = await sdk.admin.shippingProfile.list();
      const saleChannel = await sdk.admin.salesChannel.list()
      const imageNeedUpload = data.images.filter(item => typeof item !== 'string');
      let images: AdminFileListResponse | null = null;
      if (imageNeedUpload.length) {
        images = await sdk.admin.upload.create({
          files: data.images.filter(item => typeof item !== 'string'),
        })
      }

      const payload = {
        ...data,
        title: data.title,
        subtitle: data.subtitle as string,
        description: data.description,
        variants: data.variants ?? [],
        images: [
          ...data.images.filter(item => typeof item === 'string').map(url => ({ url })),
          ...images?.files.map(item => ({ url: item.url })) ?? [],
        ],
        categories: data.categories.map(id => ({ id })),
        shipping_profile_id: shippingProfile.shipping_profiles[0].id,
        sales_channels: saleChannel.sales_channels,
        status: data.status,
      }
      if (currentProduct) {
        await sdk.admin.product.update(currentProduct.id, payload as any)
      }
      else {
        await sdk.admin.product.create(payload as any, {
          fields: '+variants.inventory_items'
        })
      }

      reset();
      toast.success(currentProduct ? 'Cập nhật sản phẩm thành công' : 'Thêm mới sản phẩm thành công');
      router.push(paths.dashboard.product.root);
    } catch (error) {
      console.error(error);
    }
  });

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', [], { shouldValidate: true });
  }, [setValue]);

  const renderDetails = () => (
    <Card>
      <CardHeader title="Chi tiết" subheader="Title, short description, image..." sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="title" label="Tên sản phẩm" />

        <Field.Text name="subtitle" label="Tóm tắt" multiline rows={4} />

        <Field.MultiSelect
          checkbox
          name="categories"
          label="Danh mục"
          options={categories.map(item => ({
            label: item.name,
            value: item.id
          }))}
        />
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Mô tả</Typography>
          <Field.Editor name="description" sx={{ maxHeight: 480 }} />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Hỉnh ảnh</Typography>
          <Field.Upload
            multiple
            thumbnail
            name="images"
            maxSize={3145728}
            onRemove={handleRemoveFile}
            onRemoveAll={handleRemoveAllFiles}
            onUpload={() => console.info('ON UPLOAD')}
          />
        </Stack>
      </Stack>
    </Card>
  );


  const renderPricing = () => (
    <Card>
      <CardHeader action={<Button variant='contained' onClick={() => {
        methods.setValue('options', [...values.options, { title: '', values: [] }])
      }}>Thêm</Button>} title="Tuỳ chọn sản phẩm" subheader="Xác định các tuỳ chọn cho sản phẩm, ví dụ: Ram, CPU, màu sắc" sx={{ mb: 3 }} />
      <Divider />
      <Stack spacing={3} sx={{ p: 3 }}>
        {values.options.map((item, idx) => <Box display="flex" gap={2} alignItems="center" key={idx}>
          <Box flex={1}>
            <Field.Text
              sx={{ mb: 2 }}
              name={`options.${idx}.title`}
              label="Tên"
              placeholder="Tên tuỳ chọn"
            />
            <Field.Autocomplete
              name={`options.${idx}.values`}
              label="Giá trị"
              placeholder=""
              multiple
              freeSolo
              disableCloseOnSelect
              options={[]}
              value={item.values}
              onChange={(e, value) => {
                const newOptions = values.options.map((option, mapIdx) => {
                  if (mapIdx === idx) {
                    return {
                      ...option,
                      values: value
                    }
                  }
                  return option;
                })
                console.log(newOptions);
                methods.setValue(`options`, newOptions);
              }}
              // options={_tags.map((option) => option)}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
            />
          </Box>
          <IconButton onClick={() => {
            remove(idx)
          }} disabled={values.options.length <= 1} color='error'><Iconify icon="solar:trash-bin-trash-bold" /></IconButton>
        </Box>)}
      </Stack>
    </Card>
  );

  const renderPricingVariants = () => {
    if (values.options.length < 1) {
      return null;
    }
    return (
      <Card>
        <CardHeader title="Giá" subheader="Xác định giá cho các tuỳ chọn cho sản phẩm" sx={{ mb: 3 }} />
        <Divider />
        <Stack spacing={3} sx={{ p: 3 }}>
          {values.variants.map((item, idx) => <Box display="flex" gap={2} alignItems="center" key={idx}>
            <Box display="flex" gap={2} flex={1}>
              <Field.Text
                sx={{ mb: 2, width: '20rem' }}
                name={`variants.${idx}.title`}
                label="Tên hiển thị"
              />
              <Field.Numeric
                sx={{ mb: 2, flex: 1 }}
                name={`variants.${idx}.prices.0.amount`}
                label="Giá"
              />
            </Box>
          </Box>)}
        </Stack>
      </Card>
    )
  };

  const renderActions = () => (
    <Box
      sx={{
        gap: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <FormControlLabel
        label="Đăng"
        control={<Switch
          onChange={(_, checked) => {
            methods.setValue('status', checked ? 'published' : 'draft')
          }}
          checked={values.status === 'published'}
          defaultChecked inputProps={{ id: 'publish-switch' }} />}
        sx={{ pl: 3, flexGrow: 1 }}
      />

      <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        {!currentProduct ? 'Tạo product' : 'Lưu thay đổi'}
      </LoadingButton>
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails()}
        {/* {renderProperties()} */}
        {renderPricing()}
        {renderPricingVariants()}
        {renderActions()}
      </Stack>
    </Form>
  );
}
