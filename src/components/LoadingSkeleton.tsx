import React from 'react'

interface LoadingSkeletonProps {
    height?: number | string;
}
export default function LoadingSkeleton({ height = '5rem' }: LoadingSkeletonProps) {
    return (
        <div className='w-full animate-pulse' style={{ height: height }}>
            <div className="skeleton w-full h-full" />
        </div>
    )
}
