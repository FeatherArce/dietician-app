/**
 * 應用程式共用常數
 */

// ==================== 認證相關 ====================
export const AUTH_CONSTANTS = {
  // LocalStorage Keys
  ACCESS_TOKEN_KEY: 'auth-token',
  
  // Cookie Keys  
  REFRESH_TOKEN_KEY: 'refresh-token',
  
  // API 端點
  LOGIN_ENDPOINT: '/api/auth/login',
  LOGOUT_ENDPOINT: '/api/auth/logout', 
  REFRESH_ENDPOINT: '/api/auth/refresh',
  ME_ENDPOINT: '/api/auth/me',
  
  // 重定向路徑
  LOGIN_REDIRECT: '/auth/login',
  DEFAULT_REDIRECT_AFTER_LOGIN: '/lunch',
} as const;

// ==================== API 相關 ====================
export const API_CONSTANTS = {
  // Base URLs
  LUNCH_API_BASE: '/api/lunch',
  AUTH_API_BASE: '/api/auth',
  CRM_API_BASE: '/api/crm',
  ERP_API_BASE: '/api/erp',
  
  // Headers
  CONTENT_TYPE_JSON: 'application/json',
  AUTHORIZATION_HEADER: 'Authorization',
} as const;

// ==================== 路由相關 ====================
export const ROUTE_CONSTANTS = {
  // 認證路由
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // 主要功能路由
  LUNCH: '/lunch',
  CRM: '/crm',
  ERP: '/erp',
  
  // 商店相關路由
  LUNCH_SHOPS: '/lunch/shops',
  LUNCH_SHOP_DETAIL: (id: string) => `/lunch/shops/${id}`,
  LUNCH_SHOP_EDIT: (id: string) => `/lunch/shops/${id}/edit`,
  LUNCH_SHOP_MENU_NEW: (id: string) => `/lunch/shops/${id}/menus/new`,
  LUNCH_SHOP_MENU_EDIT: (shopId: string, menuId: string) => `/lunch/shops/${shopId}/menus/${menuId}/edit`,
} as const;

// ==================== UI 相關 ====================
export const UI_CONSTANTS = {
  // 載入狀態文字
  LOADING_TEXT: '載入中...',
  SAVING_TEXT: '儲存中...',
  DELETING_TEXT: '刪除中...',
  SUBMITTING_TEXT: '提交中...',
  
  // 通用按鈕文字
  SAVE_BUTTON: '儲存',
  CANCEL_BUTTON: '取消',
  DELETE_BUTTON: '刪除',
  EDIT_BUTTON: '編輯',
  CREATE_BUTTON: '建立',
  ADD_BUTTON: '新增',
  
  // 確認訊息
  DELETE_CONFIRMATION: '確定要刪除這個項目嗎？此操作無法復原。',
  UNSAVED_CHANGES_WARNING: '您有未儲存的變更，確定要離開嗎？',
} as const;

// ==================== 驗證相關 ====================
export const VALIDATION_CONSTANTS = {
  // 最小/最大長度
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  
  // 正則表達式
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\d\s\-\+\(\)]+$/,
  
  // 錯誤訊息
  REQUIRED_FIELD: '此欄位為必填',
  INVALID_EMAIL: '請輸入有效的電子郵件地址',
  INVALID_PHONE: '請輸入有效的電話號碼',
  PASSWORD_TOO_SHORT: `密碼至少需要 ${6} 個字元`,
  NAME_TOO_LONG: `名稱不能超過 ${100} 個字元`,
  DESCRIPTION_TOO_LONG: `描述不能超過 ${500} 個字元`,
} as const;

// ==================== 狀態相關 ====================
export const STATUS_CONSTANTS = {
  // HTTP 狀態碼
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  
  // 業務狀態
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// ==================== 預設值 ====================
export const DEFAULT_VALUES = {
  // 分頁
  PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  
  // 排序
  DEFAULT_SORT_ORDER: 0,
  
  // 菜單項目
  DEFAULT_ITEM_PRICE: 0,
  DEFAULT_ITEM_AVAILABLE: true,
  
  // 未分類名稱
  UNCATEGORIZED_NAME: '未分類',
} as const;

// ==================== 類型導出 ====================
export type AuthConstantsType = typeof AUTH_CONSTANTS;
export type ApiConstantsType = typeof API_CONSTANTS;
export type RouteConstantsType = typeof ROUTE_CONSTANTS;
export type UiConstantsType = typeof UI_CONSTANTS;
export type ValidationConstantsType = typeof VALIDATION_CONSTANTS;
export type StatusConstantsType = typeof STATUS_CONSTANTS;
export type DefaultValuesType = typeof DEFAULT_VALUES;