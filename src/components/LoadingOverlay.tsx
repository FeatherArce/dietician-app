"use client";
import { useLoadingStore } from "@/stores/loading-store";

export default function LoadingOverlay() {
    const loading = useLoadingStore((s) => s.loading);
    if (!loading) return null;
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );
}