import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type AdminTab = "dashboard" | "categories" | "subcategories" | "subjects" | "chapters" | "questions" | "users" | "teachers" | "templates" | "live-events" | "analytics" | "content";

interface AdminContextType {
  currentTab: AdminTab;
  setCurrentTab: (tab: AdminTab) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <AdminContext.Provider value={{ currentTab, setCurrentTab, isLoading, setIsLoading, refreshTrigger, triggerRefresh }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
