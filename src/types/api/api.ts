// 共用部分
interface ApiResponseBase {  
  success: boolean;
  message?: string;  // 如果 success 為 false，則會顯示錯誤訊息
}

// 自定義部分用泛型
export interface ApiResponse<T = unknown> extends ApiResponseBase {
  data?: T;
}