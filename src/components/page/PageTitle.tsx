"use client";
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { cn } from '@/libs/utils';

interface PageTitleProps {
    title?: React.ReactNode;
    /**
     * 文字大小，使用 Tailwind CSS 字體大小類別名稱
     */
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | string;
    titleClassName?: string;
    description?: React.ReactNode;
    descriptionClassName?: string;
    redirectButtonSettings?: {
        content?: React.ReactNode;
        redirect_url?: string;
    };
    appendContent?: React.ReactNode;
    marginBotton?: number;
}

export default function PageTitle({
    title,
    titleClassName,
    size = 'xl',
    description,
    descriptionClassName,
    redirectButtonSettings,
    appendContent,
    marginBotton = 6,
}: PageTitleProps) {
    const router = useRouter();

    const handleGoBack = useCallback(() => {
        if (redirectButtonSettings?.redirect_url) {
            router.push(redirectButtonSettings.redirect_url);
        } else {
            router.back();
        }
    }, [redirectButtonSettings, router]);

    return (
        <div className={cn('flex justify-between items-start', marginBotton ? `mb-${marginBotton}` : '')}>
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleGoBack}
                    className="btn btn-ghost btn-circle"
                >
                    <FaArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1
                        className={cn(
                            "font-bold flex items-center space-x-3",
                            `text-${size}`,
                            titleClassName
                        )}
                    >
                        {title}
                    </h1>
                    <p className={cn("text-base-content/70 mt-1", descriptionClassName)}>
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex space-x-2">
                {appendContent}
            </div>
        </div>
    )
}
