import prisma from '../../src/services/prisma';
import { testUserData } from './create-test-account';

async function deleteTestAccount() {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: testUserData.email,
            }
        });
        if (user) { 
            await prisma.user.delete({
                where: {
                    id: user.id,
                }
            });
            console.log("Test account deleted:", { user });
        } else {
            console.log("Test account not found, nothing to delete.");
        }
    } catch (error) {
        console.error("Error deleting test account:", { error });
    }
}

deleteTestAccount().then(() => {
    console.log("Script finished.");
    process.exit(0);
}).catch((error) => {
    console.error("Script error:", { error });
    process.exit(1);
});