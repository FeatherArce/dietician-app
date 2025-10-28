import { UserRole } from '../../prisma-generated/postgres-client';
import prisma from '../../src/services/prisma';
import { generateSecureToken, PasswordService } from '../../src/services/server/auth';

export const testUserData = {
    name: "TEST",
    email: "test@dietician.com.tw",
    password: "test@dietician.com.tw",
    role: UserRole.USER,
};

async function createTestAccount() {
    try {
        const passwordHash = await PasswordService.hash(testUserData.password);
        const emailVerifyToken = generateSecureToken();
        const user = await prisma.user.create({
            data: {
                name: testUserData.name,
                email: testUserData.email,
                password_hash: passwordHash,
                email_verified: false, // Email 需要驗證
                email_verify_token: emailVerifyToken,
                role: UserRole.USER,
                is_active: true,
                login_count: 0
            }
        });
        console.log("Admin account created:", { user });
    } catch (error) {
        console.error("Error creating admin account:", { error });
    }
}

createTestAccount().then(() => {
    console.log("Script finished.");
    process.exit(0);
}).catch((error) => {
    console.error("Script error:", { error });
    process.exit(1);
});