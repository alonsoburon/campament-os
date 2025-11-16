'use client';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/app/components/ui/form';

interface PhoneNumberInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  form: any;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  name,
  label,
  placeholder,
  form,
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <PhoneInput
              country={'cl'}
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              containerClass="flex items-center w-full rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              inputClass="!w-full !border-none !bg-transparent focus:!outline-none"
              buttonClass="!bg-transparent hover:!bg-muted !border-none"
              dropdownClass="!bg-popover !text-popover-foreground !border-border"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { PhoneNumberInput };
