import { create } from "zustand";

type SessionUser = {
  id: string;
  name: string;
  role: "SUPER_ADMIN" | "SECRETARIA" | "RECTOR" | "COORDINADOR" | "DOCENTE" | "ACUDIENTE" | "ESTUDIANTE";
};

type SessionState = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));
