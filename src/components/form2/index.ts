// Form2 組件庫統一入口
export { Form2 } from './Form2';
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
export { Input, TextArea, Select, Checkbox, RadioGroup, NumberInput } from './Form2Controls';

export {
  default as Form2List,
  type Form2ListProps,
  type ListOperations,
  type ListField
} from './Form2List';
export type {
  InputProps,
  TextAreaProps,
  SelectProps,
  CheckboxProps,
  RadioGroupProps,
  NumberInputProps,
  SelectOption,
  RadioOption
} from './Form2Controls';

// 動態表單範例
export {
  SimpleDynamicForm,
  ShoppingCartForm,
  TagManagerForm
} from './Form2SimpleDynamic';

// 陣列路徑動態表單範例
export {
  ArrayPathDynamicForm,
  NestedDynamicForm,
  MixedPathForm
} from './Form2ArrayPath';

// 默認導出複合組件
export { default } from './Form2';