"use client";
import { Breakpoint } from "@/constants/app-constants";
import { useLoadingStore } from "@/hooks/zustand/loading-store";

interface LoadingOverlayProps {
    size?: Breakpoint;
}
function LoadingOverlay({ size = Breakpoint.LG }: LoadingOverlayProps) {
    const loading = useLoadingStore((s) => s.loading);
    if (!loading) return null;
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
            <span className={`loading loading-spinner loading-${size}`}></span>
        </div>
    );
}

interface LoadingSkeletonProps {
    height?: number | string;
}
function LoadingSkeleton({ height = '5rem' }: LoadingSkeletonProps) {
    return (
        <div className='w-full animate-pulse' style={{ height: height }}>
            <div className="skeleton w-full h-full" />
        </div>
    )
}

export { LoadingOverlay, LoadingSkeleton };