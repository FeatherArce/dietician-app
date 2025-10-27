// Form2 組件庫統一入口
export { default as FormItem } from './FormItem';
export { useFormContext, FormContext } from './context';
export { pathToString, getNestedValue, setNestedValue } from './utils';

export type {
  FormValues,
  FormErrors,
  ValidationRule,
  FormItemInstance,
  FormContextType,
  Form2Props,
  FormItemProps
} from './types';

export {
  default as Input,
  type InputProps
} from './controls/Input';
export {
  default as TextArea,
  type TextAreaProps
} from './controls/TextArea';
export {
  default as Select,
  type SelectProps,
  type SelectOption
} from './controls/Select';
export {
  default as Checkbox,
  type CheckboxProps
} from './controls/Checkbox';
export {
  default as RadioGroup,
  type RadioGroupProps,
  type RadioOption
} from './controls/RadioGroup';
export {
  default as NumberInput,
  type NumberInputProps
} from './controls/NumberInput';

export {
  default as Form2List,
  type Form2ListProps,
  type ListOperations,
  type ListField
} from './Form2List';

// 默認導出複合組件
export { default as Form2 } from './Form2';