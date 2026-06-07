import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isConfiguredAdminEmail } from "@/lib/admin/admin-access";
import type { Enums } from "@/integrations/supabase/types";

type AppRole = Enums<"app_role">;

function normalizeRole(value: unknown): AppRole | null {
  return value === "admin" || value === "moderator" || value === "teacher" || value === "user" ? value : null;
}

export const useAdminCheck = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAccessRole, setSelectedAccessRole] = useState<AppRole>("admin");
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!user) {
        if (!isMounted) return;
        setUserId(null);
        setSelectedAccessRole("admin");
        setUserRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setUserId(user.id);

        const [{ data: settingsRow }, { data: rolesRows }] = await Promise.all([
          supabase.from("app_settings").select("key, value").eq("key", "admin_access_role").maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id).limit(20),
        ]);

        const settingRole = normalizeRole((settingsRow?.value as Record<string, unknown> | null)?.role) || "admin";
        const roles = (Array.isArray(rolesRows) ? rolesRows : [])
          .map((r) => normalizeRole((r as Record<string, unknown>).role))
          .filter((r): r is AppRole => Boolean(r));

        if (!isMounted) return;
        setSelectedAccessRole(settingRole);
        setUserRoles(roles);
      } catch (err) {
        console.error("Admin access check failed:", err);
        if (!isMounted) return;
        setSelectedAccessRole("admin");
        setUserRoles([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const hasAdminEmailAccess = isConfiguredAdminEmail(user?.email);
  const isAdminRole = useMemo(() => userRoles.includes("admin"), [userRoles]);
  const hasSelectedRole = useMemo(() => userRoles.includes(selectedAccessRole), [userRoles, selectedAccessRole]);
  const isAdmin = hasAdminEmailAccess || isAdminRole || hasSelectedRole;

  return {
    isAdmin,
    isLoading: isLoading || authLoading,
    userId,
    hasAdminEmailAccess,
    selectedAccessRole,
  };
};
