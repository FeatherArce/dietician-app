# 自實作認證系統設計與資料庫遷移指南

## 🎯 設計目標

建立一個遷移友善的自實作認證系統，能夠無縫從 SQLite 遷移到線上資料庫（PostgreSQL/MySQL），並為未來多種登入方式預留擴展空間。

## 🏗️ 系統架構

### 核心原則
- **資料庫無關設計**：使用 Prisma 抽象層，避免特定資料庫功能
- **統一驗證層**：在應用層處理所有驗證邏輯
- **JWT Session**：避免資料庫 session，減少遷移複雜度
- **類型安全**：完整的 TypeScript 類型定義
- **安全優先**：現代密碼加密和會話管理

### 技術棧
```typescript
const techStack = {
    database: "SQLite → PostgreSQL",
    orm: "Prisma",
    auth: "自實作 + Next.js middleware",
    encryption: "bcryptjs",
    session: "JWT",
    validation: "Zod"
};
```

## 📊 資料模型設計

### User 模型（遷移友善）
```prisma
model User {
    id            String   @id @default(uuid())
    username      String   @unique @db.VarChar(50)
    email         String   @unique @db.VarChar(255)
    password_hash String   @db.VarChar(255)  // bcrypt 固定長度
    display_name  String   @db.VarChar(100)
    role          UserRole @default(USER)
    is_active     Boolean  @default(true)
    
    // 認證相關
    email_verified    Boolean   @default(false)
    email_verify_token String?  @db.VarChar(255)
    reset_token       String?   @db.VarChar(255)
    reset_token_expires DateTime?
    
    // 審計欄位
    created_at    DateTime @default(now())
    updated_at    DateTime @updatedAt
    last_login    DateTime?
    login_count   Int      @default(0)
    
    // 為未來 OAuth 擴展預留
    oauth_accounts OAuthAccount[]
    
    // 業務關聯（既有）
    joinedEvents LunchEvent[] @relation("LunchEventAttendees")
    ownedEvents  LunchEvent[] @relation("LunchEventOwner")
    orders       Order[]

    @@map("users")
}

// 為未來 OAuth 整合預留
model OAuthAccount {
    id          String @id @default(uuid())
    user_id     String
    provider    String @db.VarChar(50)  // "discord", "google", etc.
    provider_id String @db.VarChar(255) // 第三方使用者 ID
    created_at  DateTime @default(now())
    
    user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
    
    @@unique([provider, provider_id])
    @@map("oauth_accounts")
}
```

### 資料類型設計考量
```typescript
// 確保跨資料庫一致性
const dataTypeMapping = {
    // SQLite → PostgreSQL
    "String @db.VarChar(255)": "TEXT → VARCHAR(255)",
    "Boolean": "INTEGER → BOOLEAN", 
    "DateTime": "TEXT → TIMESTAMP",
    "Float": "REAL → DECIMAL",
    "Int": "INTEGER → INTEGER"
};

// 避免的 SQLite 特定功能
const avoidFeatures = [
    "PRAGMA statements",
    "SQLite specific functions",
    "Dynamic typing advantages",
    "File-based operations"
];
```

## 🔐 認證服務架構

### 1. 密碼服務
```typescript
// services/auth/password-service.ts
export class PasswordService {
    private static readonly SALT_ROUNDS = 12;
    
    // 密碼強度驗證
    static validateStrength(password: string): ValidationResult {
        const rules = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*]/.test(password)
        };
        
        return {
            isValid: Object.values(rules).every(Boolean),
            errors: this.getPasswordErrors(rules)
        };
    }
    
    // 密碼加密
    static async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }
    
    // 密碼驗證
    static async verify(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
```

### 2. 會話服務
```typescript
// services/auth/session-service.ts
export class SessionService {
    private static readonly TOKEN_EXPIRY = '7d';
    
    static generateToken(user: PublicUser): string {
        return jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                iat: Math.floor(Date.now() / 1000)
            },
            process.env.NEXTAUTH_SECRET!,
            { expiresIn: this.TOKEN_EXPIRY }
        );
    }
    
    static verifyToken(token: string): UserSession | null {
        try {
            return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserSession;
        } catch (error) {
            return null;
        }
    }
    
    static async refreshToken(oldToken: string): Promise<string | null> {
        const session = this.verifyToken(oldToken);
        if (!session) return null;
        
        // 檢查使用者是否仍然有效
        const user = await userService.getUserById(session.userId);
        if (!user || !user.is_active) return null;
        
        return this.generateToken(user);
    }
}
```

### 3. 認證服務
```typescript
// services/auth/auth-service.ts
export class AuthService {
    // 使用者註冊
    static async register(data: RegisterData): Promise<AuthResult> {
        // 1. 驗證輸入
        const validation = registerSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, errors: validation.error.errors };
        }
        
        // 2. 檢查使用者是否已存在
        const existingUser = await this.checkUserExists(data.email, data.username);
        if (existingUser) {
            return { success: false, error: '使用者已存在' };
        }
        
        // 3. 驗證密碼強度
        const passwordValidation = PasswordService.validateStrength(data.password);
        if (!passwordValidation.isValid) {
            return { success: false, errors: passwordValidation.errors };
        }
        
        // 4. 建立使用者
        const passwordHash = await PasswordService.hash(data.password);
        const user = await userService.createUser({
            ...data,
            password_hash: passwordHash,
            email_verify_token: this.generateVerifyToken()
        });
        
        // 5. 發送驗證郵件（可選）
        await this.sendVerificationEmail(user);
        
        return { success: true, user: this.toPublicUser(user) };
    }
    
    // 使用者登入
    static async login(credentials: LoginCredentials): Promise<AuthResult> {
        // 1. 驗證輸入
        const validation = loginSchema.safeParse(credentials);
        if (!validation.success) {
            return { success: false, errors: validation.error.errors };
        }
        
        // 2. 查找使用者
        const user = await this.findUserByEmailOrUsername(credentials.identifier);
        if (!user) {
            return { success: false, error: '使用者不存在' };
        }
        
        // 3. 檢查帳號狀態
        if (!user.is_active) {
            return { success: false, error: '帳號已被停用' };
        }
        
        // 4. 驗證密碼
        const isValidPassword = await PasswordService.verify(
            credentials.password, 
            user.password_hash
        );
        
        if (!isValidPassword) {
            await this.logFailedLogin(user.id);
            return { success: false, error: '密碼錯誤' };
        }
        
        // 5. 更新登入資訊
        await this.updateLoginInfo(user.id);
        
        // 6. 生成會話
        const token = SessionService.generateToken(this.toPublicUser(user));
        
        return { 
            success: true, 
            user: this.toPublicUser(user),
            token 
        };
    }
    
    // 密碼重設
    static async requestPasswordReset(email: string): Promise<boolean> {
        const user = await userService.getUserByEmail(email);
        if (!user) return false; // 不洩露使用者是否存在
        
        const resetToken = this.generateResetToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小時
        
        await userService.updateUser(user.id, {
            reset_token: resetToken,
            reset_token_expires: expiresAt
        });
        
        await this.sendPasswordResetEmail(user.email, resetToken);
        return true;
    }
}
```

## 🔄 資料庫遷移策略

### 開發階段（SQLite）
```bash
# 1. 設定 SQLite schema
# prisma/sqlite/schema.prisma
datasource db {
    provider = "sqlite"
    url      = env("SQLITE_DATABASE_URL")
}

# 2. 生成和推送
npx prisma generate --schema=./prisma/sqlite/schema.prisma
npx prisma db push --schema=./prisma/sqlite/schema.prisma
```

### 遷移準備
```typescript
// 遷移前檢查清單
const migrationChecklist = {
    dataValidation: "確保所有資料符合目標資料庫約束",
    schemaCompatibility: "檢查 schema 在目標資料庫的相容性",
    indexOptimization: "為生產環境設計適當的索引",
    environmentVariables: "準備生產環境變數",
    backupStrategy: "建立完整的備份策略"
};
```

### 遷移執行
```bash
# 1. 建立 PostgreSQL schema
# prisma/postgres/schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("POSTGRES_DATABASE_URL")
}

# 2. 生成遷移檔案
npx prisma migrate dev --schema=./prisma/postgres/schema.prisma --name init

# 3. 資料導出/導入
# SQLite → PostgreSQL 資料遷移
node scripts/migrate-data.js

# 4. 更新應用設定
# 更改 prisma client 引用
# 更新環境變數
```

### 遷移後驗證
```typescript
// 驗證腳本
async function validateMigration() {
    // 1. 資料完整性檢查
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    
    // 2. 功能測試
    const testUser = await authService.login({
        identifier: "test@example.com",
        password: "TestPassword123!"
    });
    console.log(`Login test: ${testUser.success ? 'PASS' : 'FAIL'}`);
    
    // 3. 效能測試
    const startTime = Date.now();
    await prisma.user.findMany({ take: 100 });
    const queryTime = Date.now() - startTime;
    console.log(`Query performance: ${queryTime}ms`);
}
```

## 🛡️ 安全考量

### 密碼安全
```typescript
const securityFeatures = {
    passwordHashing: "bcrypt with 12 rounds",
    sessionManagement: "JWT with secure headers",
    rateLimiting: "登入嘗試限制",
    tokenExpiry: "7天自動過期",
    secureHeaders: "CSRF, XSS 防護"
};
```

### 中間件保護
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
    // 1. 驗證 JWT token
    // 2. 檢查路由權限
    // 3. 更新會話
    // 4. 設定安全 headers
}
```

## 📋 實作階段規劃

### 階段一：核心認證
- [ ] User 模型更新
- [ ] 密碼服務實作
- [ ] 會話服務實作
- [ ] 認證 API 端點
- [ ] 登入/註冊頁面

### 階段二：安全增強
- [ ] 中間件保護
- [ ] 密碼重設功能
- [ ] Email 驗證
- [ ] 登入限制
- [ ] 安全日誌

### 階段三：使用者體驗
- [ ] 前端表單驗證
- [ ] 錯誤處理
- [ ] 載入狀態
- [ ] 記住登入
- [ ] 使用者設定頁面

### 階段四：遷移準備
- [ ] 雙資料庫設定
- [ ] 遷移腳本
- [ ] 驗證工具
- [ ] 效能測試
- [ ] 備份策略

## 🚀 環境設定

### 開發環境
```bash
# .env.local
SQLITE_DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Email 設定（可選）
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 生產環境
```bash
# .env.production
POSTGRES_DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# 安全設定
BCRYPT_ROUNDS="12"
JWT_EXPIRY="7d"
MAX_LOGIN_ATTEMPTS="5"
```

## 🔍 監控與維護

### 效能監控
```typescript
// 關鍵指標
const metrics = {
    loginSuccess: "成功登入率",
    responseTime: "API 回應時間",
    databaseConnections: "資料庫連線數",
    errorRate: "錯誤發生率"
};
```

### 安全監控
```typescript
// 安全事件記錄
const securityEvents = {
    failedLogins: "登入失敗次數",
    suspiciousActivity: "可疑活動",
    tokenMisuse: "Token 濫用",
    bruteForceAttempts: "暴力破解嘗試"
};
```

## 📚 最佳實踐

### 開發實踐
1. **漸進式實作**：從基本功能開始，逐步增加複雜性
2. **完整測試**：單元測試、整合測試、端對端測試
3. **文檔維護**：API 文檔、使用者指南、開發指南
4. **版本控制**：使用語意化版本，詳細的提交訊息

### 安全實踐
1. **最小權限原則**：使用者只能存取必要的資源
2. **定期更新**：依賴套件和安全補丁
3. **安全審計**：定期檢查安全設定和漏洞
4. **備份策略**：定期備份和災難復原計畫

## 🎯 成功指標

### 技術指標
- [ ] 100% TypeScript 類型覆蓋
- [ ] 90%+ 測試覆蓋率
- [ ] < 200ms API 回應時間
- [ ] 零資料庫遷移錯誤

### 業務指標
- [ ] 使用者滿意度 > 90%
- [ ] 登入成功率 > 98%
- [ ] 零安全事件
- [ ] 99.9% 系統可用性

這個設計確保了從 SQLite 到線上資料庫的平滑遷移，同時建立了一個可擴展、安全的認證系統基礎。