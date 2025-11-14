import { User, UserRole } from "@/prisma-generated/postgres-client";
import type { User as NextAuthUser } from "next-auth";
import prisma from "../../prisma";
import userService from "../user-services";
import { PasswordService } from "./password-service";
import {
  ChangePasswordData,
  changePasswordSchema,
  RegisterData,
  registerSchema,
  ResetPasswordData,
  ResetPasswordRequestData,
  UpdateProfileData,
  updateProfileSchema,
} from "./validation-schemas";

// 認證結果類型
export interface AuthResult {
  success: boolean;
  user?: NextAuthUser;
  token?: string;
  refreshToken?: string;
  message?: string;
  errors?: string[];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const foundUser = await prisma.user.findUnique({
    where: { email },
  });
  return foundUser ? foundUser : null;
}

/**
 * 根據 Email 獲取使用者
 */
export async function getNextAuthUserByEmail(
  email: string
): Promise<NextAuthUser | null> {
  const foundUser = await prisma.user.findUnique({
    where: { email },
  });
  return foundUser ? userService.toNextAuthUser(foundUser) : null;
}

interface EmailCheckResult {
  exists: boolean;
  message?: string;
  user?: NextAuthUser;
}

/**
 * 檢查使用者是否存在
 */
export async function checkUserExists(
  email: string
): Promise<EmailCheckResult> {
  const existingUser = await getNextAuthUserByEmail(email);

  if (existingUser) {
    return { exists: true, message: "Email 已被註冊", user: existingUser };
  }

  return { exists: false };
}

/**
 * 使用者註冊
 */
export async function register(data: RegisterData): Promise<AuthResult> {
  try {
    // 1. 驗證輸入資料
    const validation = registerSchema.safeParse(data);
    if (!validation?.success) {
      return {
        success: false,
        errors: (validation?.error?.issues).map((e) => e.message),
      };
    }

    const validatedData = validation?.data;

    // 2. 檢查使用者是否已存在
    const existingUser = await checkUserExists(validatedData.email);

    if (existingUser.exists) {
      return {
        success: false,
        message: existingUser.message,
      };
    }

    // 3. 驗證密碼強度
    const passwordValidation = PasswordService.validateStrength(
      validatedData.password
    );
    if (!passwordValidation.isValid) {
      return {
        success: false,
        errors: passwordValidation.errors,
      };
    }

    // 4. 加密密碼
    const passwordHash = await PasswordService.hash(validatedData.password);

    // 5. 生成 email 驗證 token
    const emailVerifyToken = undefined;

    // 6. 建立使用者
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password_hash: passwordHash,
        email_verified: false, // Email 需要驗證
        role: UserRole.USER,
        is_active: true,
        login_count: 0,
      },
    });

    // 7. 發送驗證郵件（如果有 email）
    if (validatedData.email && emailVerifyToken) {
      //   TODO: 發送驗證郵件
    }

    // 8. 生成 token
    const publicUser = userService.toNextAuthUser(user);

    return {
      success: true,
      user: publicUser,
      message: validatedData.email
        ? "註冊成功！請檢查您的 Email 以驗證帳號。"
        : "註冊成功！",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "註冊失敗，請稍後再試",
    };
  }
}

interface DiscordOAuthUserParams {
  type?: string;
  provider: string;
  providerAccountId: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  image?: string;
}

/**
 * OAuth 註冊或綁定帳號
 */
export async function registerOrConnectOAuthUser({
  type = "oauth",
  email,
  email_verified = false,
  name,
  image,
  provider,
  providerAccountId,
}: DiscordOAuthUserParams): Promise<AuthResult> {
  try {
    // 1. 檢查 Account 是否已存在
    const account = await prisma.account.findFirst({
      where: { provider, providerAccountId },
      include: { user: true },
    });
    if (account && account.user) {
      await userService.updateLoginInfo(account.user.id);
      // 已有 Account 與 User，直接登入
      return { success: true, user: account.user };
    }

    // 2. 檢查 User 是否已存在
    let user = await prisma.user.findUnique({ where: { email } });
    if (user && (user.is_active === false || user.is_deleted === true)) {
      return { success: false, message: "帳號已被停用或刪除，請聯絡管理員。" };
    }

    if (user) {
      // 2a. User 存在但無 Account，繼續往下建立 Account 綁定
      // 更新使用者資料（如果需要）
      await userService.updateLoginInfo(user.id);
    } else {
      // 3. 都不存在，建立 User
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          image,
          email_verified: email_verified,
          is_active: true,
          role: UserRole.USER,
          login_count: 0,
          last_login: new Date(),
        },
      });
    }

    // 4. 建立 Account 綁定
    await prisma.account.create({
      data: {
        userId: user.id,
        provider,
        providerAccountId,
        type: type,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("OAuth 註冊/綁定失敗", error);
    return { success: false, message: "OAuth 註冊/綁定失敗" };
  }
}

/**
 * 請求密碼重設
 */
export async function requestPasswordReset(
  data: ResetPasswordRequestData
): Promise<boolean> {
  try {
    // TODO: 要求重設密碼流程

    return true;
  } catch (error) {
    console.error("Password reset request error:", error);
    return false;
  }
}

/**
 * 重設密碼
 */
export async function resetPassword(
  data: ResetPasswordData
): Promise<AuthResult> {
  try {
    // TODO: 重設密碼流程

    return {
      success: true,
      message: "密碼重設成功，請使用新密碼登入",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: "密碼重設失敗，請稍後再試",
    };
  }
}

/**
 * 更改密碼
 */
export async function changePassword(
  userId: string,
  data: ChangePasswordData
): Promise<AuthResult> {
  try {
    const validation = changePasswordSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.issues.map((e) => e.message),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password_hash) {
      return {
        success: false,
        message: "使用者不存在或未設定密碼",
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
        message: "當前密碼錯誤",
      };
    }

    // 驗證新密碼強度
    const passwordValidation = PasswordService.validateStrength(
      data.newPassword
    );
    if (!passwordValidation.isValid) {
      return {
        success: false,
        errors: passwordValidation.errors,
      };
    }

    const newPasswordHash = await PasswordService.hash(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
      },
    });

    return {
      success: true,
      message: "密碼更改成功",
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: "密碼更改失敗，請稍後再試",
    };
  }
}

/**
 * 更新個人資料
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<AuthResult> {
  try {
    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.issues.map((e) => e.message),
      };
    }

    // 如果更新 email，檢查是否已被使用
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        return {
          success: false,
          message: "Email 已被其他使用者使用",
        };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        // 如果更新 email，需要重新驗證
        email_verified: data.email ? false : undefined,
        // email_verify_token: data.email ? generateSecureToken() : undefined
      },
    });

    // 如果更新了 email，發送驗證郵件
    // if (data.email && updatedUser.email_verify_token) {
    //     await sendVerificationEmail(data.email, updatedUser.email_verify_token);
    // }

    return {
      success: true,
      user: userService.toNextAuthUser(updatedUser),
      message: data.email
        ? "個人資料更新成功！請檢查新 Email 以完成驗證。"
        : "個人資料更新成功！",
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      message: "個人資料更新失敗，請稍後再試",
    };
  }
}
