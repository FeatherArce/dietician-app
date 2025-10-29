"use client";
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

interface UnauthorizedViewProps {
    title?: string;
    message?: string;
    redirectBtnText?: string;
    redirectUrl?: string;
}

export default function UnauthorizedView({
    title = "權限不足",
    message = "您沒有權限使用此功能",
    redirectBtnText = "返回",
    redirectUrl
}: UnauthorizedViewProps) {
    const router = useRouter();

    const handleRedirect = useCallback(() => {
        if (redirectUrl) {
            router.push(redirectUrl);
        } else {
            router.back();
        }
    }, [router, redirectUrl]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="mb-4">{message}</p>
                <button
                    onClick={handleRedirect}
                    className="btn btn-primary"
                >
                    {redirectBtnText}
                </button>
            </div>
        </div>
    )
}
