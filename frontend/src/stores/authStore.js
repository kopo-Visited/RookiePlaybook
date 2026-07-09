import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    set => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      updateUser: patch => set(state => ({ user: { ...state.user, ...patch } })),
    }),
    { name: 'auth-storage' }
  )
);

export default useAuthStore;
