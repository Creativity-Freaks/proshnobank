import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useAuth } from "@/contexts/AuthContext";
import { isConfiguredAdminEmail } from "@/lib/admin-access";

export const useAdminCheck = () => {
  const { hasRole, isLoading, userId } = useRoleCheck(["admin"]);
  const { user, isLoading: authLoading } = useAuth();

  const hasAdminEmailAccess = isConfiguredAdminEmail(user?.email);
  const isAdmin = hasRole || hasAdminEmailAccess;

  return {
    isAdmin,
    isLoading: isLoading || authLoading,
    userId,
    hasAdminEmailAccess,
  };
};
