import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import Input from './Input';

interface Props<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  mask?: (v: string) => string;
}

export default function FormField<T extends FieldValues>({
  control,
  name,
  label,
  mask,
  ...rest
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <Input
          label={label}
          value={(value as string) ?? ''}
          onBlur={onBlur}
          onChangeText={(t) => onChange(mask ? mask(t) : t)}
          error={error?.message}
          {...rest}
        />
      )}
    />
  );
}