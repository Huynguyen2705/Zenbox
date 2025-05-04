import type { TextFieldProps } from '@mui/material';
import type { NumericFormatProps } from 'react-number-format';

import { NumericFormat } from 'react-number-format';
import { Controller, useFormContext } from 'react-hook-form';

import { TextField } from '@mui/material';


// ----------------------------------------------------------------------

export type RHFNumberInputProps = NumericFormatProps &
  TextFieldProps & {
    name: string;
    ignoreError?: boolean;
  };

export function RHFNumberic({
  name,
  helperText,
  ignoreError,
  ...other
}: RHFNumberInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <NumericFormat
          {...field}
          onChange={undefined} // tránh field gọi lại onChange khi format
          thousandSeparator
          value={field.value == null ? '' : field.value}
          onValueChange={(value) => {
            field.onChange(
              // nếu onChange undefined form sẽ lấy lại defaultValues -> cần set null;
              value.floatValue === undefined ? null : value.floatValue
            );
          }}
          max={Number.MAX_SAFE_INTEGER}
          {...other}
          customInput={TextField}
          error={!!error && !ignoreError}
          helperText={ignoreError ? '' : error?.message ?? helperText}
        />
      )}
    />
  );
}
