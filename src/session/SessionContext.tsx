import { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "student" | "teacher" | null;

interface SessionContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  lmsUnlocked: boolean;
  setLmsUnlocked: (unlocked: boolean) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [lmsUnlocked, setLmsUnlocked] = useState(false);

  return (
    <SessionContext.Provider value={{ userRole, setUserRole, lmsUnlocked, setLmsUnlocked }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
