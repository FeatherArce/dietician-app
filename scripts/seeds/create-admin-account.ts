// 直接使用 pnpm script 執行此檔案以建立管理員帳號
import { UserRole } from '../../prisma-generated/postgres-client';
import prisma from '../../src/services/prisma';
import { PasswordService } from '../../src/services/server/auth/password-service';

async function createAdminAccount() {
    const adminData = {
        name: "Site Admin",
        email: "admin@dietician.com.tw",
        password: "dietician073714455",
        role: "admin",
    };

    try {
        const passwordHash = await PasswordService.hash(adminData.password);
        const user = await prisma.user.create({
            data: {
                name: adminData.name,
                email: adminData.email,
                password_hash: passwordHash,
                email_verified: false, // Email 需要驗證
                role: UserRole.ADMIN,
                is_active: true,
                login_count: 0
            }
        });
        console.log("Admin account created:", { user });
    } catch (error) {
        console.error("Error creating admin account:", { error });
    }
}

createAdminAccount().then(() => {
    console.log("Script finished.");
    process.exit(0);
}).catch((error) => {
    console.error("Script error:", { error });
    process.exit(1);
});