import { create } from "zustand";

interface ModalState {
  signInOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
}

export const useModalStore = create<ModalState>(set => ({
  signInOpen: false,
  openSignIn: () => set({ signInOpen: true }),
  closeSignIn: () => set({ signInOpen: false }),
}));
