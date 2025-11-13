import { UserRole } from "@/prisma-generated/postgres-client";
import type { User as NextAuthUser } from 'next-auth';
import prisma from "../../prisma";
import { generateSecureToken, PasswordService } from "./password-service";
import { ChangePasswordData, changePasswordSchema, RegisterData, registerSchema, ResetPasswordData, ResetPasswordRequestData, resetPasswordRequestSchema, resetPasswordSchema, UpdateProfileData, updateProfileSchema } from "./validation-schemas";
import userService from "../user-services";

interface EmailCheckResult {
    exists: boolean;
    message?: string;
}

// 認證結果類型
export interface AuthResult {
    success: boolean;
    user?: NextAuthUser;
    token?: string;
    refreshToken?: string;
    message?: string;
    errors?: string[];
}

// 登入認證類型
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

async function checkUserExists(email: string): Promise<EmailCheckResult> {
    const existingUser = await prisma.user.findFirst({
        where: { email }
    });

    if (existingUser) {
        return { exists: true, message: 'Email 已被註冊' };
    }

    return { exists: false };
}

async function sendVerificationEmail(email: string, token: string): Promise<void> {
    // 這裡實作發送驗證郵件的邏輯
    // 例如：使用 Nodemailer 或其他郵件服務
    console.log(`Verification email would be sent to: ${email} with token: ${token}`);
}

async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // 這裡實作發送密碼重設郵件的邏輯
    console.log(`Password reset email would be sent to: ${email} with token: ${token}`);
}

/**
 * 使用者註冊
 * @param data 註冊資料
 * @returns Promise<AuthResult> 註冊結果
 */
export async function register(data: RegisterData): Promise<AuthResult> {
    try {
        // 1. 驗證輸入資料
        const validation = registerSchema.safeParse(data);
        if (!validation?.success) {
            return {
                success: false,
                errors: (validation?.error?.issues).map(e => e.message)
            };
        }

        const validatedData = validation?.data;

        // 2. 檢查使用者是否已存在
        const existingUser = await checkUserExists(
            validatedData.email
        );

        if (existingUser.exists) {
            return {
                success: false,
                message: existingUser.message
            };
        }

        // 3. 驗證密碼強度
        const passwordValidation = PasswordService.validateStrength(validatedData.password);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                errors: passwordValidation.errors
            };
        }

        // 4. 加密密碼
        const passwordHash = await PasswordService.hash(validatedData.password);

        // 5. 生成 email 驗證 token
        const emailVerifyToken = generateSecureToken();

        // 6. 建立使用者
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password_hash: passwordHash,
                email_verified: false, // Email 需要驗證
                email_verify_token: emailVerifyToken,
                role: UserRole.USER,
                is_active: true,
                login_count: 0
            }
        });

        // 7. 發送驗證郵件（如果有 email）
        if (validatedData.email && emailVerifyToken) {
            await sendVerificationEmail(validatedData.email, emailVerifyToken);
        }

        // 8. 生成 token
        const publicUser = userService.toNextAuthUser(user);

        return {
            success: true,
            user: publicUser,
            message: validatedData.email ?
                '註冊成功！請檢查您的 Email 以驗證帳號。' :
                '註冊成功！'
        };

    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: '註冊失敗，請稍後再試'
        };
    }
}

/**
 * 請求密碼重設
 * @param data 重設請求資料
 * @returns Promise<boolean> 是否成功發送重設郵件
 */
export async function requestPasswordReset(data: ResetPasswordRequestData): Promise<boolean> {
    try {
        const validation = resetPasswordRequestSchema.safeParse(data);
        if (!validation.success) {
            return false;
        }

        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        // 不管使用者是否存在都返回 true，避免洩露使用者資訊
        if (!user) {
            return true;
        }

        const resetToken = generateSecureToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小時

        await prisma.user.update({
            where: { id: user.id },
            data: {
                reset_token: resetToken,
                reset_token_expires: expiresAt
            }
        });

        await sendPasswordResetEmail(user.email!, resetToken);
        return true;

    } catch (error) {
        console.error('Password reset request error:', error);
        return false;
    }
}


/**
 * 重設密碼
 * @param data 重設資料
 * @returns Promise<AuthResult> 重設結果
 */
export async function resetPassword(data: ResetPasswordData): Promise<AuthResult> {
    try {
        const validation = resetPasswordSchema.safeParse(data);
        if (!validation.success) {
            return {
                success: false,
                errors: validation.error.issues.map(e => e.message)
            };
        }

        const user = await prisma.user.findFirst({
            where: {
                reset_token: data.token,
                reset_token_expires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return {
                success: false,
                message: '重設連結無效或已過期'
            };
        }

        // 驗證新密碼強度
        const passwordValidation = PasswordService.validateStrength(data.password);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                errors: passwordValidation.errors
            };
        }

        const passwordHash = await PasswordService.hash(data.password);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: passwordHash,
                reset_token: null,
                reset_token_expires: null
            }
        });

        return {
            success: true,
            message: '密碼重設成功，請使用新密碼登入'
        };

    } catch (error) {
        console.error('Password reset error:', error);
        return {
            success: false,
            message: '密碼重設失敗，請稍後再試'
        };
    }
}

/**
 * 更改密碼
 * @param userId 使用者ID
 * @param data 更改密碼資料
 * @returns Promise<AuthResult> 更改結果
 */
export async function changePassword(userId: string, data: ChangePasswordData): Promise<AuthResult> {
    try {
        const validation = changePasswordSchema.safeParse(data);
        if (!validation.success) {
            return {
                success: false,
                errors: validation.error.issues.map(e => e.message)
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.password_hash) {
            return {
                success: false,
                message: '使用者不存在或未設定密碼'
            };
        }

        // 驗證當前密碼
        const isCurrentPasswordValid = await PasswordService.verify(
            data.currentPassword,
            user.password_hash
        );

        if (!isCurrentPasswordValid) {
            return {
                success: false,
                message: '當前密碼錯誤'
            };
        }

        // 驗證新密碼強度
        const passwordValidation = PasswordService.validateStrength(data.newPassword);
        if (!passwordValidation.isValid) {
            return {
                success: false,
                errors: passwordValidation.errors
            };
        }

        const newPasswordHash = await PasswordService.hash(data.newPassword);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password_hash: newPasswordHash
            }
        });

        return {
            success: true,
            message: '密碼更改成功'
        };

    } catch (error) {
        console.error('Change password error:', error);
        return {
            success: false,
            message: '密碼更改失敗，請稍後再試'
        };
    }
}

/**
 * 更新個人資料
 * @param userId 使用者ID
 * @param data 更新資料
 * @returns Promise<AuthResult> 更新結果
 */
export async function updateProfile(userId: string, data: UpdateProfileData): Promise<AuthResult> {
    try {
        const validation = updateProfileSchema.safeParse(data);
        if (!validation.success) {
            return {
                success: false,
                errors: validation.error.issues.map(e => e.message)
            };
        }

        // 如果更新 email，檢查是否已被使用
        if (data.email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: data.email,
                    id: { not: userId }
                }
            });

            if (existingUser) {
                return {
                    success: false,
                    message: 'Email 已被其他使用者使用'
                };
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                // 如果更新 email，需要重新驗證
                email_verified: data.email ? false : undefined,
                email_verify_token: data.email ? generateSecureToken() : undefined
            }
        });

        // 如果更新了 email，發送驗證郵件
        if (data.email && updatedUser.email_verify_token) {
            await sendVerificationEmail(data.email, updatedUser.email_verify_token);
        }

        return {
            success: true,
            user: userService.toNextAuthUser(updatedUser),
            message: data.email ?
                '個人資料更新成功！請檢查新 Email 以完成驗證。' :
                '個人資料更新成功！'
        };

    } catch (error) {
        console.error('Update profile error:', error);
        return {
            success: false,
            message: '個人資料更新失敗，請稍後再試'
        };
    }
}