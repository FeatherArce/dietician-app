import React, { useState } from 'react';
import SearchContainer from '@/components/SearchContainer';
import {
  SearchInput,
  Select,
  DateRange,
  NumberRange,
  CheckboxGroup,
  RadioGroup
} from '@/components/SearchContainer/SearchFields';

// 使用範例：在商店頁面中使用
export default function ShopsSearchExample() {
  // 搜尋狀態
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'ACTIVE' | 'INACTIVE'>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [maxRating, setMaxRating] = useState<number | ''>('');
  const [features, setFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');

  // 重置所有搜尋條件
  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
    setMinRating('');
    setMaxRating('');
    setFeatures([]);
    setSortBy('name');
  };

  // 狀態選項
  const statusOptions = [
    { value: 'ACTIVE', label: '營業中' },
    { value: 'INACTIVE', label: '暫停營業' }
  ];

  // 分類選項
  const categoryOptions = [
    { value: '', label: '所有分類' },
    { value: 'chinese', label: '中式料理' },
    { value: 'western', label: '西式料理' },
    { value: 'japanese', label: '日式料理' },
    { value: 'korean', label: '韓式料理' },
    { value: 'thai', label: '泰式料理' }
  ];

  // 特色選項
  const featureOptions = [
    { value: 'delivery', label: '外送服務' },
    { value: 'vegetarian', label: '素食選項' },
    { value: 'parking', label: '停車場' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'credit_card', label: '信用卡' }
  ];

  // 排序選項
  const sortOptions = [
    { value: 'name', label: '按名稱排序' },
    { value: 'rating', label: '按評分排序' },
    { value: 'distance', label: '按距離排序' },
    { value: 'price', label: '按價格排序' }
  ];

  return (
    <div>
      {/* 基本搜尋容器 - 2欄布局 */}
      <SearchContainer
        title="商店搜尋"
        description="搜尋和篩選商店資訊"
        columns={2}
        gap="md"
        onReset={handleReset}
        showResetButton={true}
      >
        <SearchInput
          label="關鍵字搜尋"
          placeholder="搜尋商店名稱、地址或電話..."
          value={searchTerm}
          onChange={setSearchTerm}
          allowClear={true}
        />

        <Select
          label="營業狀態"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as '' | 'ACTIVE' | 'INACTIVE')}
          options={statusOptions}
          allowClear={true}
        />
      </SearchContainer>

      {/* 進階搜尋容器 - 3欄布局，可收合 */}
      <SearchContainer
        title="進階篩選"
        description="更多篩選條件幫您精確找到商店"
        columns={3}
        gap="lg"
        collapsible={true}
        defaultCollapsed={false}
        onReset={handleReset}
      >
        <Select
          label="料理分類"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
          allowClear={true}
        />

        <DateRange
          label="開業時間"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          allowClear={true}
        />

        <NumberRange
          label="評分範圍"
          minValue={minRating}
          maxValue={maxRating}
          onMinChange={setMinRating}
          onMaxChange={setMaxRating}
          minPlaceholder="最低分"
          maxPlaceholder="最高分"
          allowClear={true}
        />

        <CheckboxGroup
          label="特色服務"
          options={featureOptions}
          selectedValues={features}
          onChange={setFeatures}
          className="md:col-span-2"
          allowClear={true}
        />

        <RadioGroup
          label="排序方式"
          name="sort"
          options={sortOptions}
          selectedValue={sortBy}
          onChange={setSortBy}
        />
      </SearchContainer>

      {/* 簡化搜尋容器 - 1欄布局 */}
      <SearchContainer
        title="快速搜尋"
        columns={1}
        showResetButton={false}
        className="mb-4"
      >
        <SearchInput
          placeholder="快速搜尋商店..."
          value={searchTerm}
          onChange={setSearchTerm}
          allowClear={true}
        />
      </SearchContainer>
    </div>
  );
}

// 在實際頁面中的使用範例
export function ShopsPageWithSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'ACTIVE' | 'INACTIVE'>('');

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const statusOptions = [
    { value: 'ACTIVE', label: '營業中' },
    { value: 'INACTIVE', label: '暫停營業' }
  ];

  return (
    <div className="md:container md:mx-auto px-4 max-w-full overflow-hidden">
      {/* 其他頁面內容... */}
      
      {/* 搜尋容器 */}
      <SearchContainer
        title="搜尋和篩選"
        columns={2}
        onReset={handleReset}
      >
        <SearchInput
          label="商店搜尋"
          placeholder="搜尋商店名稱、地址或電話..."
          value={searchTerm}
          onChange={setSearchTerm}
          allowClear={true}
        />

        <Select
          label="狀態篩選"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as '' | 'ACTIVE' | 'INACTIVE')}
          options={statusOptions}
          allowClear={true}
        />
      </SearchContainer>

      {/* DataTable 或其他內容... */}
    </div>
  );
}