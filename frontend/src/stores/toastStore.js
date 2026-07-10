import { create } from 'zustand';

const useToastStore = create(set => ({
  message: null,
  show: message => set({ message }),
  hide: () => set({ message: null }),
}));

export default useToastStore;
