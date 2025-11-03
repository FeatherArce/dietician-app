"use client";
import { cn } from '@/libs/utils';
import React, { useState, useMemo } from 'react';
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaTimes
} from 'react-icons/fa';

// 對齊方式
export type TextAlign = 'left' | 'center' | 'right';

// 排序方向
export type SortDirection = 'asc' | 'desc' | null;

// 獲取巢狀物件值的輔助函數
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  if (!path) return undefined;

  // 如果路徑不包含點，直接返回屬性值
  if (!path.includes('.')) {
    return obj[path];
  }

  // 處理巢狀路徑，如 'user.profile.name'
  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }

  return current;
};

// 欄位定義
export interface Column<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: keyof T | string; // 支援巢狀路徑，如 'user.profile.name'
  align?: TextAlign;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  className?: string;
}

// 總結欄配置
export interface SummaryConfig<T = Record<string, unknown>> {
  show?: boolean;
  showDivider?: boolean;
  fixed?: boolean; // 是否固定在底部（不受分頁影響）
  columns: Array<{
    key: string; // 對應到 Column 的 key
    type?: 'sum' | 'avg' | 'count' | 'custom'; // 總結類型
    render?: (
      data: T[], // 當前資料（受搜尋、篩選、分頁影響）
      allData: T[], // 全部資料（不受分頁影響）
      column: Column<T>
    ) => React.ReactNode;
    precision?: number; // 數值精度（小數點位數）
    prefix?: string; // 前綴文字
    suffix?: string; // 後綴文字
  }>;
}

// 分頁設定
export interface PaginationConfig {
  current: number;
  pageSize: number;
  // total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

// 表格屬性
export interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  dataSource: T[];
  loading?: boolean;
  pagination?: PaginationConfig | false;
  summary?: SummaryConfig<T>; // 總結欄配置
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
  emptyText?: string;
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
  };
}

function DataTable<T extends Record<string, unknown>>({
  columns = [],
  dataSource = [],
  loading = false,
  pagination = {
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: false,
    showTotal: true,
  },
  summary,
  className = '',
  size = 'md',
  bordered = true,
  striped = true,
  hover = true,
  compact = false,
  emptyText = '暫無資料',
  onRow
}: DataTableProps<T>) {
  // 狀態管理
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination ? pagination.pageSize : 10);

  // 處理搜尋
  const filteredData = useMemo(() => {
    let result = [...dataSource];

    // 欄位篩選
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter(record => {
          const column = columns.find(col => col.key === key);
          const dataKey = column?.dataIndex || column?.key;
          const value = dataKey ? getNestedValue(record, String(dataKey)) : '';
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    return result;
  }, [dataSource, filters, columns]);

  // 處理排序
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    const column = columns.find(col => col.key === sortKey);
    const dataKey = column?.dataIndex || column?.key;
    if (!dataKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, String(dataKey));
      const bValue = getNestedValue(b, String(dataKey));

      if (aValue === bValue) return 0;

      let result = 0;
      if (aValue != null && bValue != null && aValue < bValue) result = -1;
      if (aValue != null && bValue != null && aValue > bValue) result = 1;

      return sortDirection === 'desc' ? -result : result;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // 處理分頁
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  // 計算總結數據
  const calculateSummary = (
    summaryColumn: SummaryConfig<T>['columns'][0],
    data: T[],
    allData: T[]
  ): React.ReactNode => {
    const column = columns.find(col => col.key === summaryColumn.key);
    if (!column) return '';

    // 如果有自定義渲染函數，直接使用
    if (summaryColumn.render) {
      return summaryColumn.render(data, allData, column);
    }

    // 如果沒有指定類型，返回空
    if (!summaryColumn.type) return '';

    // 獲取數值數據
    const values = data
      .map(record => {
        const dataKey = column.dataIndex || column.key;
        const value = dataKey ? getNestedValue(record, String(dataKey)) : 0;
        return typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      })
      .filter(val => !isNaN(val));

    let result: number | string = 0;

    switch (summaryColumn.type) {
      case 'sum':
        result = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'avg':
        result = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
        break;
      case 'count':
        result = data.length;
        break;
      default:
        result = '';
    }

    // 格式化數值
    if (typeof result === 'number' && summaryColumn.precision !== undefined) {
      result = result.toFixed(summaryColumn.precision);
    }

    // 添加前綴和後綴
    const prefix = summaryColumn.prefix || '';
    const suffix = summaryColumn.suffix || '';

    return `${prefix}${result}${suffix}`;
  };

  // 排序處理
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortKey === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey('');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  // 篩選處理
  const handleFilter = (columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1);
  };

  // 清除篩選
  const clearFilter = (columnKey: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  // 分頁處理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // 獲取表格樣式
  const getTableClassName = () => {
    const classes = ['table', 'w-full', 'text-nowrap'];

    if (size === 'xs') classes.push('table-xs');
    else if (size === 'sm') classes.push('table-sm');
    else if (size === 'lg') classes.push('table-lg');

    if (bordered) classes.push('rounded-box', 'border', 'border-base-content/5', 'bg-base-100');
    if (striped) classes.push('table-zebra');
    if (hover) classes.push('table-hover');
    if (compact) classes.push('table-compact');

    return classes.join(' ');
  };

  // 獲取對齊樣式
  const getTextAlignClass = (align?: TextAlign) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const getFlexAlignClass = (align?: TextAlign) => {
    switch (align) {
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-start';
    }
  };

  // 渲染排序圖標
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const isActive = sortKey === column.key;

    if (!isActive) {
      return <FaSort className="w-3 h-3 text-base-content/30" />;
    }

    return sortDirection === 'asc'
      ? <FaSortUp className="w-3 h-3 text-primary" />
      : <FaSortDown className="w-3 h-3 text-primary" />;
  };

  // 渲染分頁
  const renderPagination = () => {
    if (!pagination) return null;

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          {pagination.showSizeChanger && (
            <div className="flex items-center gap-2">
              <span className="text-base md:text-sm text-nowrap">每頁顯示</span>
              <select
                className="select select-bordered select-sm text-base md:text-sm"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((size: number) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-base md:text-sm">筆</span>
            </div>
          )}

          {pagination.showTotal && (
            <span className="text-base md:text-sm text-base-content/70">
              共 {sortedData.length} 筆資料
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="btn-group">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <FaChevronLeft className="w-3 h-3" />
            </button>

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
              <button
                key={page}
                className={`btn btn-sm ${currentPage === page ? 'btn-active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <FaChevronRight className="w-3 h-3" />
            </button>
          </div>

          {pagination.showQuickJumper && (
            <div className="flex items-center gap-2">
              <span className="text-base md:text-sm">跳至</span>
              <input
                type="number"
                className="input input-bordered input-sm w-16 text-base md:text-sm"
                min={1}
                max={totalPages}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const page = Number((e.target as HTMLInputElement).value);
                    if (page >= 1 && page <= totalPages) {
                      handlePageChange(page);
                    }
                  }
                }}
              />
              <span className="text-sm">頁</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染總結欄
  const renderSummary = () => {
    if (!summary) {
      return null;
    }
    if (!!summary && summary?.show === undefined) {
      // 默認顯示總結欄
    }
    if (!summary?.show || summary.columns.length === 0) {
      return null;
    }

    // 決定使用哪個數據集進行計算
    const summaryData = summary.fixed ? sortedData : paginatedData;
    const allData = sortedData;

    return (
      <tfoot
        className={cn(
          'bg-base-200',
          (summary.showDivider || summary.showDivider === undefined) ? 'border-t border-base-content/50' : ''
        )}
      >
        {/* <tr>
          <td colSpan={columns.length} className="text-left font-semibold">
            總計
          </td>
        </tr> */}
        <tr className="font-semibold">
          {columns.map((column) => {
            const summaryColumn = summary.columns.find(sc => sc.key === column.key);

            return (
              <td
                key={column.key}
                className={`${getTextAlignClass(column.align)} ${column.className || ''} text-base md:text-sm font-medium`}
              >
                {summaryColumn ? calculateSummary(summaryColumn, summaryData, allData) : ''}
              </td>
            );
          })}
        </tr>
      </tfoot>
    );
  };

  return (
    <div className={`w-full text-base md:text-sm ${className}`}>
      {/* 表格容器 - 使用 overflow-x-auto 處理水平滾動 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className={getTableClassName()}>
            <colgroup>
              {columns.map((column) => (
                <col key={column.key} style={{ width: column.width }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {columns.map((column) => {
                  const alignClass = getFlexAlignClass(column.align);
                  return (
                    <th
                      key={column.key}
                      className={`${column.className || ''} text-base md:text-sm font-medium`}
                    >
                      <div className={cn("flex items-center gap-2", alignClass)}>
                        <span
                          className={cn(alignClass, column.sortable ? 'cursor-pointer select-none' : '')}
                          onClick={() => handleSort(column.key)}
                        >
                          {column.title}
                        </span>

                        {renderSortIcon(column)}

                        {/* 篩選功能 */}
                        {column.filterable && (
                          <div className="dropdown dropdown-bottom dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">
                              <FaFilter className={`w-3 h-3 ${filters[column.key] ? 'text-primary' : 'text-base-content/30'}`} />
                            </div>
                            <div tabIndex={0} className="dropdown-content card card-compact w-64 p-2 shadow bg-base-100 z-[1]">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder={`篩選 ${column.title}`}
                                  className="input input-bordered input-sm flex-1"
                                  value={filters[column.key] || ''}
                                  onChange={(e) => handleFilter(column.key, e.target.value)}
                                />
                                {filters[column.key] && (
                                  <button
                                    className="btn btn-ghost btn-sm btn-circle"
                                    onClick={() => clearFilter(column.key)}
                                  >
                                    <FaTimes className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-8 text-base-content/50">
                    {emptyText}
                  </td>
                </tr>
              ) : (
                paginatedData.map((record, index) => {
                  const rowProps = onRow?.(record, index) || {};
                  return (
                    <tr
                      key={index}
                      className={`${rowProps.className || ''} ${rowProps.onClick ? 'cursor-pointer' : ''}`}
                      onClick={rowProps.onClick}
                      onDoubleClick={rowProps.onDoubleClick}
                    >
                      {columns.map((column) => {
                        const dataKey = column.dataIndex || column.key;
                        const value = dataKey ? getNestedValue(record, String(dataKey)) : '';
                        const content = column.render
                          ? column.render(value, record, index)
                          : String(value || '');

                        return (
                          <td
                            key={column.key}
                            className={`${getTextAlignClass(column.align)} ${column.className || ''} text-base md:text-sm py-3`}
                          >
                            {content}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* 總結欄 */}
            {renderSummary()}
          </table>
        </div>
      </div>

      {/* 分頁 */}
      {renderPagination()}
    </div>
  );
}

export default DataTable;