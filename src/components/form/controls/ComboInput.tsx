import { forwardRef } from "react";
import UiComboInput, { ComboInputOption, ComboInputProps as UiComboInputProps } from "@/components/ui/ComboInput";

// Form 控件版本的 ComboInput
export interface ComboInputProps extends Omit<UiComboInputProps, 'onChange' | 'value'> {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onBlur?: () => void;
  error?: string | string[];
}

const ComboInput = forwardRef<HTMLInputElement, ComboInputProps>(({
  value,
  onChange,
  onBlur,
  error,
  className = '',
  ...props
}, ref) => {
  const handleChange = (newValue: string | string[]) => {
    onChange?.(newValue);
  };

  return (
    <UiComboInput
      ref={ref}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      error={error}
      className={className}
      {...props}
    />
  );
});

ComboInput.displayName = 'ComboInput';

export default ComboInput;
export type { ComboInputOption };
