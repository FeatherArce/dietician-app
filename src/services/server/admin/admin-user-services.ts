import prisma from '@/services/prisma';
import { User, UserRole, Prisma } from '@/prisma-generated/postgres-client';

export const adminUserService = {
    getUserById: async (userId: string) => {
        // Implementation for fetching user by ID
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            return user;
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            throw new Error('Failed to fetch user');
        }
    },
    updateUserById: async (userId: string, data: any) => {
        // Implementation for updating user by ID
        try {
            const user = await prisma.user.update({
                where: { id: userId },
                data,
            });
            return user;
        } catch (error) {
            console.error(`Error updating user with ID ${userId}:`, error);
            throw new Error('Failed to update user');
        }
    },
    deleteUserById: async (userId: string) => {
        // Implementation for deleting user by ID
        try {
            const user = await prisma.user.delete({
                where: { id: userId },
            });
            return user;
        } catch (error) {
            console.error(`Error deleting user with ID ${userId}:`, error);
            throw new Error('Failed to delete user');
        }
    }
};