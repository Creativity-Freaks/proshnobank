import { useRoleCheck } from "@/hooks/useRoleCheck";

export const useAdminCheck = () => {
  const { hasRole, isLoading, userId } = useRoleCheck(["admin"]);
  return { isAdmin: hasRole, isLoading, userId };
};
