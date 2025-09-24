import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from 'zustand';
import { createJSONStorage, persist } from "zustand/middleware";

type User = {
  id: string;
  userName: string;
};

type AuthState = {
  user: User | null;
  token?: string;
  isHydrated: boolean;
  setCredentials: (p: { user: User; token?: string }) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
};


export const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        token: undefined,
        isHydrated: false,
        setCredentials: ({ user, token }) => set({ user, token }),
        logout: () => set({ user: null, token: undefined }),
        setHydrated: (b) => set({ isHydrated: b })
      }),
      {
        name: "auth-store",
        storage: createJSONStorage(() => AsyncStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true);
        }
      }
    )
  );
