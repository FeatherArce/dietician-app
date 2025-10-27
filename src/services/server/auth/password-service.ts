import bcrypt from 'bcryptjs';

// 密碼驗證結果類型
export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    score: number; // 0-100 強度分數
}

// 密碼強度規則
interface PasswordRules {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    noCommonPatterns: boolean;
}

/**
 * 密碼管理服務
 * 提供密碼加密、驗證、強度檢查等功能
 * 設計為跨資料庫相容，遷移友善
 */
export class PasswordService {
    // 加密輪數（固定值，確保跨環境一致性）
    private static readonly SALT_ROUNDS = 12;

    // 常見弱密碼模式
    private static readonly COMMON_PATTERNS = [
        '123456', 'password', 'qwerty', 'abc123', 
        '111111', '123123', 'admin', 'letmein',
        'welcome', 'monkey', '1234567890'
    ];

    /**
     * 密碼加密
     * @param password 明文密碼
     * @returns Promise<string> 加密後的密碼 hash
     */
    static async hash(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, this.SALT_ROUNDS);
        } catch (error) {
            console.error('Password hashing failed:', error);
            throw new Error('密碼加密失敗');
        }
    }

    /**
     * 密碼驗證
     * @param password 明文密碼
     * @param hash 儲存的密碼 hash
     * @returns Promise<boolean> 是否匹配
     */
    static async verify(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            console.error('Password verification failed:', error);
            return false;
        }
    }

    /**
     * 密碼強度驗證
     * @param password 待驗證的密碼
     * @returns PasswordValidationResult 驗證結果
     */
    static validateStrength(password: string): PasswordValidationResult {
        const rules = this.checkPasswordRules(password);
        const errors = this.getPasswordErrors(rules);
        const score = this.calculatePasswordScore(password, rules);

        return {
            isValid: errors.length === 0,
            errors,
            score
        };
    }

    /**
     * 檢查密碼是否符合基本規則
     * @param password 密碼
     * @returns PasswordRules 規則檢查結果
     */
    private static checkPasswordRules(password: string): PasswordRules {
        return {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            noCommonPatterns: !this.COMMON_PATTERNS.some(pattern => 
                password.toLowerCase().includes(pattern.toLowerCase())
            )
        };
    }

    /**
     * 獲取密碼錯誤訊息
     * @param rules 規則檢查結果
     * @returns string[] 錯誤訊息陣列
     */
    private static getPasswordErrors(rules: PasswordRules): string[] {
        const errors: string[] = [];

        if (!rules.minLength) {
            errors.push('密碼至少需要 8 個字符');
        }
        // MVP: 暫時註解掉複雜的密碼規則
        // if (!rules.hasUppercase) {
        //     errors.push('需要包含至少一個大寫字母');
        // }
        // if (!rules.hasLowercase) {
        //     errors.push('需要包含至少一個小寫字母');
        // }
        // if (!rules.hasNumber) {
        //     errors.push('需要包含至少一個數字');
        // }
        // if (!rules.hasSpecialChar) {
        //     errors.push('需要包含至少一個特殊符號 (!@#$%^&* 等)');
        // }
        // if (!rules.noCommonPatterns) {
        //     errors.push('不能包含常見的弱密碼模式');
        // }

        return errors;
    }

    /**
     * 計算密碼強度分數
     * @param password 密碼
     * @param rules 規則檢查結果
     * @returns number 0-100 的分數
     */
    private static calculatePasswordScore(password: string, rules: PasswordRules): number {
        let score = 0;

        // MVP: 簡化評分，主要基於長度
        if (rules.minLength) score += 60; // 滿足最低要求就給 60 分

        // 長度加分
        if (password.length >= 12) score += 20;
        if (password.length >= 16) score += 20;

        // 可選的複雜度加分（不強制要求）
        if (rules.hasUppercase) score += 5;
        if (rules.hasLowercase) score += 5;
        if (rules.hasNumber) score += 5;
        if (rules.hasSpecialChar) score += 5;

        return Math.min(score, 100);
    }

    /**
     * 獲取密碼強度等級描述
     * @param score 強度分數
     * @returns string 強度等級
     */
    static getStrengthLevel(score: number): string {
        if (score >= 90) return '非常強';
        if (score >= 70) return '強';
        if (score >= 50) return '中等';
        if (score >= 30) return '弱';
        return '非常弱';
    }

    /**
     * 生成隨機密碼
     * @param length 密碼長度（預設 12）
     * @returns string 隨機密碼
     */
    static generateRandomPassword(length: number = 12): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        const allChars = uppercase + lowercase + numbers + symbols;
        
        // 確保至少包含一個每種類型的字符
        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];

        // 填充剩餘長度
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // 打亂字符順序
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    /**
     * 檢查密碼是否已洩露（簡化版本）
     * 實際使用時可以整合 HaveIBeenPwned API
     * @param password 密碼
     * @returns Promise<boolean> 是否已洩露
     */
    static async checkIfCompromised(password: string): Promise<boolean> {
        // 簡化實作：檢查是否為常見弱密碼
        const lowerPassword = password.toLowerCase();
        return this.COMMON_PATTERNS.some(pattern => 
            lowerPassword.includes(pattern)
        );
    }
}