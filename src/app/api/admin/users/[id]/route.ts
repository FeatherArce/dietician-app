// api/admin/user/[id]/route.ts
// Can Get/Update full user data, and really Delete a user
import { NextRequest, NextResponse } from 'next/server';
import { adminUserService } from '@/services/server/admin/admin-user-services';
import { ApiMessage } from '@/app/api/utils';
import { auth } from '@/libs/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {       
         const session = await auth();
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return ApiMessage.error(401);
        }

        const { id: userId } = await params;
        const user = await adminUserService.getUserById(userId);

        if (!user) {
            return ApiMessage.error(404, '找不到使用者');
        }
        return NextResponse.json({
            user,
            success: true
        });
    } catch (error) {
        return ApiMessage.error(500, 'Failed to fetch user');
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const data = await request.json();
        const updatedUser = await adminUserService.updateUserById(userId, data);

        if (!updatedUser) {
            return ApiMessage.error(404, 'Could not find user to update');
        }
        return NextResponse.json({
            user: updatedUser,
            success: true
        });
    } catch (error) {
        return ApiMessage.error(500, 'Failed to update user');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const deleted = await adminUserService.deleteUserById(userId);

        if (!deleted) {
            return ApiMessage.error(404, 'Could not find user to delete');
        }
        return NextResponse.json({
            success: true
        });
    } catch (error) {
        return ApiMessage.error(500, 'Failed to delete user');
    }
}
