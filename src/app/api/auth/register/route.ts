import { register } from '@/services/server/auth/auth-services';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // 使用 AuthService 進行註冊
        const result = await register(body);
        
        if (!result.success) {
            return NextResponse.json(
                { 
                    error: result.message || 'Registration failed',
                    errors: result.errors 
                }, 
                { status: 400 }
            );
        }

        const { user } = result;
        
        if (!user) {
            return NextResponse.json(
                { error: 'Registration failed - missing user data' }, 
                { status: 500 }
            );
        }
        
        // 只返回註冊結果，登入由前端通過 signIn() 處理
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            message: 'Registration successful. Please sign in.'
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}