import { auth } from "@/libs/auth";
import { UserRole } from "@/prisma-generated/postgres-client";
import prisma from "@/libs/prisma";
import { PasswordService } from "@/services/auth/password-service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.id) {
        return NextResponse.json({ error: '缺少使用者 ID' }, { status: 400 });
    }
    
    const passwordHash = await PasswordService.hash(data.new_password);
    const user = await prisma.user.update({
        where: { id: '9c1e9ac6-fc22-4700-9519-5b41286d73b8' },
        data: { password_hash: passwordHash },
    });

    return NextResponse.json({ message: '員工已新增', data: { user } });
}
