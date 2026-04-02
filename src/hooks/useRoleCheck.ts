import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "teacher" | "user";

export const useRoleCheck = (allowedRoles: AppRole[]) => {
  const [hasRole, setHasRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const normalizedRoles = [...allowedRoles].sort();
  const rolesKey = normalizedRoles.join(",");

  useEffect(() => {
    const roles = rolesKey.split(",").filter(Boolean) as AppRole[];

    const checkRoleStatus = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setHasRole(false);
          setUserId(null);
          setIsLoading(false);
          return;
        }

        setUserId(session.user.id);

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .limit(20);

        if (error) {
          console.error("Error checking role status:", error);
          setHasRole(false);
        } else {
          const hasAllowedRole = (data ?? []).some((item) => roles.includes(item.role as AppRole));
          setHasRole(hasAllowedRole);
        }
      } catch (error) {
        console.error("Error checking role status:", error);
        setHasRole(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRoleStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setIsLoading(true);
      checkRoleStatus();
    });

    return () => subscription.unsubscribe();
  }, [rolesKey]);

  return { hasRole, isLoading, userId };
};
