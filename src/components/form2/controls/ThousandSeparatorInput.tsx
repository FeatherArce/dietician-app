import React, { useState } from 'react';

// 協助移除千分位符號、貨幣符號等，只留下數字和小數點
const cleanNumber = (value: string) => {
  // 移除所有非數字、非小數點的字元
  return value.replace(/[^\d.]/g, '');
};

// 格式化數字為帶有千分位分隔符的字串
const formatNumber = (value: string) => {
  if (!value) return '';

  // 確保使用您想要的地區設定 (例如 'en-US' 使用逗號作為千分位)
  // 您也可以使用 navigator.language 來自動使用用戶的本地設定
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0, // 不自動添加小數位數
    maximumFractionDigits: 20, // 允許較多的小數位數
  });

  const parts = value.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : '';

  // 格式化整數部分
  const formattedInteger = formatter.format(Number(integerPart));

  // 處理小數點部分
  if (decimalPart !== '') {
    return `${formattedInteger}.${decimalPart}`;
  } else if (value.endsWith('.')) {
    // 確保使用者可以輸入小數點並保持它
    return `${formattedInteger}.`;
  }

  return formattedInteger;
};

export default function ThousandSeparatorInput({
  value,
  onChange,
  className = "input input-bordered w-full", // daisyUI 樣式
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: string | number;
  onChange: (value: string) => void;
}
) {
  // 內部狀態用於處理輸入欄顯示的格式化字串
  const [displayValue, setDisplayValue] = useState(formatNumber(String(value)));

  // 當使用者輸入時觸發
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = event.target.value;

    // 1. 清理輸入，只保留數字和小數點
    const cleaned = cleanNumber(rawInput);

    // 2. 格式化以供顯示
    const newDisplayValue = formatNumber(cleaned);
    setDisplayValue(newDisplayValue);

    // 3. 回調父元件的 onChange，傳遞純數字（或數字字串）
    // 如果 cleaned 是空字串，則傳遞空字串
    // 否則，將其轉換為數字（或者您可以選擇傳遞 cleaned 保持字串類型）
    // 這裡我們傳遞純數字字串，通常更安全
    onChange(cleaned);
  };

  // 處理元件外部值更新
  React.useEffect(() => {
    // 只有當外部傳入的值與當前純數字格式化後不同時才更新
    const formattedExternalValue = formatNumber(String(value));
    if (formattedExternalValue !== displayValue) {
      setDisplayValue(formattedExternalValue);
    }
  }, [displayValue, value]);

  return (
    <input
      type="text" // 必須是 text 才能顯示千分位符號
      value={displayValue}
      onChange={handleChange}
      className={className}
      inputMode="numeric" // 在移動裝置上會提示數字鍵盤
      {...props}
    />
  );
};