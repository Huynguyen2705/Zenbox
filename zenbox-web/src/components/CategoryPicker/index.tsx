
import type { AdminProductCategory } from '@medusajs/types';

import React, { useRef, useState, useEffect } from 'react';

import { TextField, Autocomplete } from '@mui/material';

import { useGetAdminCategories } from 'src/hooks/category';


interface BasketPickerProps {
  name: string;
  label: string;
  onChange?(basket: AdminProductCategory | null): void;
  selected?: AdminProductCategory | null;
  disabledClear?: boolean;
}

const CategoryPicker = (props: BasketPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState<AdminProductCategory | null>(props.selected ?? null);
  const [name, setName] = useState<string | null>();
  const timer = useRef<NodeJS.Timeout>();
  const { categories, categoriesLoading } = useGetAdminCategories({
    offset: 0,
    limit: 200,
    ...(name &&
      !selectedCategory && {
      name,
    }),
  });

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedCategory?.id !== props.selected?.id || selectedCategory?.name !== props.selected?.name) {
      props.onChange?.(selectedCategory);
    }
  }, [selectedCategory]);

  return (
    <Autocomplete
      options={categories}
      value={selectedCategory}
      loading={categoriesLoading}
      onInputChange={(event, value) => {
        if (timer.current) {
          clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => {
          setName(value);
        }, 200);
      }}
      onChange={(_, value) => {
        setSelectedCategory(value);
      }}
      disableClearable={props.disabledClear}
      getOptionKey={(option) => option!.id}
      getOptionLabel={(option) => `${option!.name}`}
      renderInput={(params) => <TextField {...params} label={props.label} />}
    />
  );
};

export default CategoryPicker;
