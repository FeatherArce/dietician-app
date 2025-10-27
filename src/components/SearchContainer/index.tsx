import React from 'react';

interface SearchContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  // 配置選項
  collapsible?: boolean; // 是否可收合
  defaultCollapsed?: boolean; // 預設是否收合
  columns?: 1 | 2 | 3 | 4 | 6; // 網格欄數
  gap?: 'sm' | 'md' | 'lg'; // 間距大小
  // 操作按鈕
  onReset?: () => void; // 重置回調
  resetText?: string; // 重置按鈕文字
  showResetButton?: boolean; // 是否顯示重置按鈕
}

const SearchContainer: React.FC<SearchContainerProps> = ({
  children,
  title = "搜尋條件",
  description,
  className = "",
  collapsible = false,
  defaultCollapsed = false,
  columns = 4,
  gap = 'md',
  onReset,
  resetText = "重置",
  showResetButton = true,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  // 獲取網格樣式
  const getGridClassName = () => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
    };

    const gaps = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return `grid ${gridCols[columns]} ${gaps[gap]}`;
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className={`card bg-base-100 shadow-sm ${className}`}>
      <div className="card-body">
        {/* 標題區域 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="card-title text-lg">
              {title}
              {collapsible && (
                <button
                  type="button"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="btn btn-ghost btn-sm ml-2"
                  aria-label={isCollapsed ? "展開搜尋" : "收合搜尋"}
                >
                  {isCollapsed ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </button>
              )}
            </h3>
            {description && (
              <p className="text-sm text-base-content/70 mt-1">
                {description}
              </p>
            )}
          </div>

          {/* 操作按鈕區域 */}
          {showResetButton && onReset && !isCollapsed && (
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-ghost btn-sm"
            >
              {resetText}
            </button>
          )}
        </div>

        {/* 搜尋條件區域 */}
        {!isCollapsed && (
          <div className={getGridClassName()}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchContainer;