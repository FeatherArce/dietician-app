import React, { forwardRef, useEffect, useRef, useState } from "react";
import { RxCross2, RxChevronDown } from "react-icons/rx";

export interface ComboInputOption {
  value: string;
  label?: string;
}

export interface ComboInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  options?: (string | ComboInputOption)[];
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  allowClear?: boolean;
  maxDropdownHeight?: number;
  error?: string | string[];
}

function ComboInput(
  {
    value,
    onChange,
    options = [],
    multiple = false,
    size = 'md',
    allowClear = true,
    maxDropdownHeight = 200,
    error,
    className = '',
    placeholder = '請輸入或選擇...',
    disabled = false,
    ...props
  }: ComboInputProps,
  ref: React.Ref<HTMLInputElement>
) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 標準化選項格式
  const normalizedOptions: ComboInputOption[] = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // 從 props 衍生狀態，不使用 useEffect
  const selectedItems = multiple && Array.isArray(value) ? value : [];
  const currentInputValue = !multiple && typeof value === 'string' ? value : inputValue;

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 處理輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (multiple) {
      // 多選模式：更新內部輸入值用於過濾
      setInputValue(newValue);
    } else {
      // 單選模式：直接更新外部值
      onChange?.(newValue);
    }
  };

  // 處理輸入框聚焦
  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // 處理選項點擊
  const handleOptionClick = (option: ComboInputOption) => {
    if (multiple) {
      // 多選模式
      const newSelectedItems = selectedItems.includes(option.value)
        ? selectedItems.filter(item => item !== option.value)
        : [...selectedItems, option.value];
      
      onChange?.(newSelectedItems);
      setInputValue(''); // 清空過濾輸入
      inputRef.current?.focus();
    } else {
      // 單選模式
      onChange?.(option.value);
      setIsOpen(false);
    }
  };

  // 處理標籤移除
  const handleRemoveTag = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelectedItems = selectedItems.filter(item => item !== itemToRemove);
    onChange?.(newSelectedItems);
  };

  // 處理清空
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange?.([]);
      setInputValue(''); // 清空過濾輸入
    } else {
      onChange?.('');
    }
    inputRef.current?.focus();
  };

  // 處理鍵盤事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (multiple) {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        // 添加自定義項目
        const newSelectedItems = [...selectedItems, inputValue.trim()];
        onChange?.(newSelectedItems);
        setInputValue('');
      } else if (e.key === 'Backspace' && !inputValue && selectedItems.length > 0) {
        // 刪除最後一個標籤
        const newSelectedItems = selectedItems.slice(0, -1);
        onChange?.(newSelectedItems);
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(false);
      }
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // 過濾選項（多選時使用內部 inputValue，單選時使用當前值）
  const searchTerm = (multiple ? inputValue : currentInputValue).toLowerCase();
  const filteredOptions = normalizedOptions.filter(option => {
    const optionLabel = (option.label || option.value).toLowerCase();
    return optionLabel.includes(searchTerm);
  });

  // 獲取標籤顯示文字
  const getTagLabel = (value: string): string => {
    const option = normalizedOptions.find(opt => opt.value === value);
    return option?.label || value;
  };

  // 樣式類別
  const sizeClass = {
    sm: 'input-sm text-sm',
    md: '',
    lg: 'input-lg text-lg'
  }[size];

  const errorClass = error ? 'input-error' : '';
  const disabledClass = disabled ? 'input-disabled cursor-not-allowed' : '';

  const hasValue = multiple ? selectedItems.length > 0 : currentInputValue.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 主輸入區域 */}
      <div
        className={`
          input input-bordered w-full flex items-center gap-1 cursor-text
          ${sizeClass} ${errorClass} ${disabledClass} ${className}
        `.trim()}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {/* 多選標籤 */}
        {multiple && selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selectedItems.map((item, index) => (
              <span
                key={index}
                className="badge badge-primary gap-1 flex-shrink-0"
              >
                <span className="truncate max-w-[120px]">{getTagLabel(item)}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-circle p-0 h-4 w-4 min-h-0"
                    onClick={(e) => handleRemoveTag(item, e)}
                  >
                    <RxCross2 className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* 輸入框 */}
        <input
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.RefObject<HTMLInputElement | null>).current = node;
            }
            (inputRef as React.RefObject<HTMLInputElement | null>).current = node;
          }}
          type="text"
          value={multiple ? inputValue : currentInputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={multiple && selectedItems.length > 0 ? '' : placeholder}
          disabled={disabled}
          className="flex-1 min-w-0 outline-none bg-transparent"
          {...props}
        />

        {/* 右側按鈕區域 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* 清空按鈕 */}
          {allowClear && hasValue && !disabled && (
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={handleClear}
              tabIndex={-1}
            >
              <RxCross2 className="w-4 h-4" />
            </button>
          )}

          {/* 下拉箭頭 */}
          {!disabled && (
            <button
              type="button"
              className={`btn btn-ghost btn-xs btn-circle transition-transform ${isOpen ? 'rotate-180' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
              tabIndex={-1}
            >
              <RxChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 下拉選項列表 */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg overflow-hidden"
          style={{ maxHeight: maxDropdownHeight }}
        >
          <div className="overflow-y-auto max-h-full">
            {filteredOptions.length > 0 ? (
              <ul className="menu p-1">
                {filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? selectedItems.includes(option.value)
                    : currentInputValue === option.value;

                  return (
                    <li key={index}>
                      <a
                        className={`
                          flex items-center justify-between
                          ${isSelected ? 'active' : ''}
                        `.trim()}
                        onClick={() => handleOptionClick(option)}
                      >
                        <span>{option.label || option.value}</span>
                        {multiple && isSelected && (
                          <span className="text-primary">✓</span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4 text-center text-base-content/50">
                {inputValue ? '無匹配選項' : '無可用選項'}
                {multiple && inputValue && (
                  <div className="mt-2 text-xs">
                    按 Enter 添加 "{inputValue}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(ComboInput);
