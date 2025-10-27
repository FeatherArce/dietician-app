// 認證服務統一導出
export { PasswordService } from './password-service';
export { SessionService } from './session-service';
export { EdgeSessionService } from './edge-session-service';
export { AuthService } from './auth-service';
export { generateSecureToken, isValidEmail, isValidUsername } from './edge-utils';
export { getSessionFromRequest } from './request-utils';

// 類型導出
export type { PasswordValidationResult } from './password-service';
export type { UserSession, PublicUser, TokenOptions } from './session-service';
export type { AuthResult, LoginCredentials } from './auth-service';
export type {
    RegisterData,
    LoginData,
    ResetPasswordRequestData,
    ResetPasswordData,
    ChangePasswordData,
    UpdateProfileData
} from './validation-schemas';

// Schema 導出
export {
    registerSchema,
    loginSchema,
    resetPasswordRequestSchema,
    resetPasswordSchema,
    changePasswordSchema,
    updateProfileSchema
} from './validation-schemas';