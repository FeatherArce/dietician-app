import { create } from "zustand";

type LoadingState = {
    loading: boolean;
    setLoading: (v: boolean) => void;
};

export const useLoadingStore = create<LoadingState>((set) => ({
    loading: false,
    setLoading: (v: boolean) => set({ loading: v }),
}));