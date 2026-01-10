import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserState {
  username?: string;
  token?: string;
  id?: string;
  avatar?: string;
  language: string;
  hasHydrated: boolean;
  setHasHydrated: () => void;
  setUser: (data: Partial<UserState>) => void;
  clearUser: () => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  setAvatar: (avatar: string) => void;
  setLanguage: (lang: string) => void; 
  phantomPublicKey?: string;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      username: undefined,
      token: undefined,
      avatar: undefined,
      id: undefined,
      language: "en", 
      hasHydrated: false,
      phantomPublicKey: undefined,
      setHasHydrated: () => set({ hasHydrated: true }),
      setUser: (data) => set((state) => ({ ...state, ...data })),
      clearUser: () =>
        set({
          username: undefined,
          token: undefined,
          avatar: undefined,
          id: undefined,
          language: get().language  , 
        }),

      logout: () =>
      set({
        username: undefined,
        token: undefined,
        avatar: undefined,
        phantomPublicKey: undefined,
        id: undefined,
        language: get().language, 
      }),
  
      isLoggedIn: () => !!get().token,
      setAvatar: (avatar) => set({ avatar }),
      setLanguage: (lang) => set({ language: lang }), 
    }),
    {
      name: "user-storage", 
      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    }
  )
);
