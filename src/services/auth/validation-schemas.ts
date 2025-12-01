import { z } from 'zod';

// 註冊資料驗證 schema
export const registerSchema = z.object({
    name: z.string()
        .min(1, '顯示名稱不能為空')
        .max(100, '顯示名稱不能超過 100 個字符'),
    
    email: z.string()
        .email('請輸入有效的 Email 地址')
        .max(255, 'Email 不能超過 255 個字符'),
    
    password: z.string()
        .min(8, '密碼至少需要 8 個字符')
        .max(100, '密碼不能超過 100 個字符'),
    
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: '密碼確認不一致',
    path: ['confirmPassword']
});

// 登入資料驗證 schema
export const loginSchema = z.object({
    email: z.string()
        .min(1, '請輸入 Email')
        .email('請輸入有效的 Email 格式')
        .max(255, '輸入內容過長'),
    
    password: z.string()
        .min(1, '請輸入密碼')
        .max(100, '密碼過長'),
    
    rememberMe: z.boolean().optional()
});

// 密碼重設請求 schema
export const resetPasswordRequestSchema = z.object({
    email: z.string()
        .email('請輸入有效的 Email 地址')
        .max(255, 'Email 不能超過 255 個字符')
});

// 密碼重設 schema
export const resetPasswordSchema = z.object({
    token: z.string()
        .min(1, '重設 token 不能為空'),
    
    password: z.string()
        .min(8, '新密碼至少需要 8 個字符')
        .max(100, '新密碼不能超過 100 個字符'),
    
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: '密碼確認不一致',
    path: ['confirmPassword']
});

// 更改密碼 schema
export const changePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, '請輸入當前密碼'),
    
    newPassword: z.string()
        .min(8, '新密碼至少需要 8 個字符')
        .max(100, '新密碼不能超過 100 個字符'),
    
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: '新密碼確認不一致',
    path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: '新密碼不能與當前密碼相同',
    path: ['newPassword']
});

// 更新個人資料 schema
export const updateProfileSchema = z.object({
    name: z.string()
        .min(1, '顯示名稱不能為空')
        .max(100, '顯示名稱不能超過 100 個字符')
        .optional(),
    
    email: z.string()
        .email('請輸入有效的 Email 地址')
        .max(255, 'Email 不能超過 255 個字符')
        .optional(),
    
    note: z.string()
        .max(500, '備註不能超過 500 個字符')
        .optional(),
    
    preferred_theme: z.string()
        .min(1, '主題不能為空')
        .max(50, '主題名稱過長')
        .optional()
});

// 類型導出
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ResetPasswordRequestData = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;