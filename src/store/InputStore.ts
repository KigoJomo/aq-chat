import { create } from 'zustand';

interface InputState {
  value: string;
  updateValue: (newValue: string) => void;
}

export const useInput = create<InputState>((set) => ({
  value: '',
  updateValue: (newValue) => set({ value: newValue }),
}));