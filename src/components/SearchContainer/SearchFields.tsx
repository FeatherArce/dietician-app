import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

// 基礎搜尋輸入框
interface SearchInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  allowClear?: boolean; // 是否顯示清除按鈕
}

export const SearchInput: React.FC<SearchInputProps> = ({
  label,
  placeholder = "請輸入搜尋關鍵字...",
  value,
  onChange,
  icon = <FaSearch className="w-4 h-4" />,
  className = "",
  allowClear = false,
}) => {
  const handleClear = () => {
    onChange('');
  };

  const showClearButton = allowClear && value;

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      {allowClear ? (
        <div className="join w-full">
          <label className="input input-bordered flex items-center gap-2 join-item flex-1">
            {icon}
            <input
              type="text"
              className="grow"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={handleClear}
            className={`btn btn-neutral join-item ${showClearButton ? '' : 'btn-disabled'}`}
            title="清除"
            disabled={!showClearButton}
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="input input-bordered flex items-center gap-2 w-full">
          {icon}
          <input
            type="text"
            className="grow"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      )}
    </div>
  );
};

// 下拉選單
interface SelectProps<T = string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  placeholder?: string;
  className?: string;
  allowClear?: boolean; // 是否顯示清除按鈕
  layoutOptions?: React.SelectHTMLAttributes<HTMLDivElement>;
}

export const Select = <T extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder = "請選擇...",
  className = "",
  layoutOptions = {
    className: "w-full",
  },
  allowClear = false,
}: SelectProps<T>) => {
  const handleClear = () => {
    // 找到第一個空值選項，或使用空字串
    const defaultOption = options.find(opt => opt.value === '');
    if (defaultOption) {
      onChange(defaultOption.value);
    } else {
      onChange('' as T);
    }
  };

  const showClearButton = allowClear && value && value !== '';

  return (
    <div className={`form-control ${layoutOptions?.className}`}>
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      {showClearButton ? (
        <div className="join w-full">
          <select
            className={`select select-bordered join-item flex-1 ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-neutral join-item"
            title="清除選擇"
          >
            <FaTimes className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <select
          className={`select select-bordered ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

// 日期範圍選擇器
interface DateRangeProps {
  label?: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
  allowClear?: boolean; // 是否顯示清除按鈕
}

export const DateRange: React.FC<DateRangeProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className = "",
  allowClear = false,
}) => {
  const handleClear = () => {
    onStartDateChange('');
    onEndDateChange('');
  };

  const showClearButton = allowClear && (startDate || endDate);

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-neutral btn-xs p-1 min-h-0 h-auto"
              title="清除日期"
            >
              <FaTimes className="w-3 h-3 opacity-60 hover:opacity-100" />
            </button>
          )}
        </div>
      )}
      <div className="join w-full">
        <input
          type="date"
          className="input input-bordered join-item flex-1"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <span className="btn btn-disabled join-item px-3">至</span>
        <input
          type="date"
          className="input input-bordered join-item flex-1"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>
    </div>
  );
};

// 數字範圍選擇器
interface NumberRangeProps {
  label?: string;
  minValue: number | '';
  maxValue: number | '';
  onMinChange: (value: number | '') => void;
  onMaxChange: (value: number | '') => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  className?: string;
  allowClear?: boolean; // 是否顯示清除按鈕
}

export const NumberRange: React.FC<NumberRangeProps> = ({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minPlaceholder = "最小值",
  maxPlaceholder = "最大值",
  className = "",
  allowClear = false,
}) => {
  const handleClear = () => {
    onMinChange('');
    onMaxChange('');
  };

  const showClearButton = allowClear && (minValue !== '' || maxValue !== '');

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-neutral btn-xs p-1 min-h-0 h-auto"
              title="清除數值"
            >
              <FaTimes className="w-3 h-3 opacity-60 hover:opacity-100" />
            </button>
          )}
        </div>
      )}
      <div className="join w-full">
        <input
          type="number"
          className="input input-bordered join-item flex-1"
          placeholder={minPlaceholder}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value ? Number(e.target.value) : '')}
        />
        <span className="btn btn-disabled join-item px-3">~</span>
        <input
          type="number"
          className="input input-bordered join-item flex-1"
          placeholder={maxPlaceholder}
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value ? Number(e.target.value) : '')}
        />
      </div>
    </div>
  );
};

// 多選 Checkbox 群組
interface CheckboxGroupProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
  allowClear?: boolean; // 是否顯示清除按鈕
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  className = "",
  allowClear = false,
}) => {
  const handleChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter(v => v !== value));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const showClearButton = allowClear && selectedValues.length > 0;

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-neutral btn-xs p-1 min-h-0 h-auto"
              title="清除選擇"
            >
              <FaTimes className="w-3 h-3 opacity-60 hover:opacity-100" />
            </button>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="label cursor-pointer gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selectedValues.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
            />
            <span className="label-text">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// 單選 Radio 群組
interface RadioGroupProps {
  label?: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
  className = "",
}) => {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="label cursor-pointer gap-2">
            <input
              type="radio"
              name={name}
              className="radio radio-sm"
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="label-text">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};