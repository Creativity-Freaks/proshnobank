import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "teacher" | "user";

export const useRoleCheck = (allowedRoles: AppRole[]) => {
  const [hasRole, setHasRole] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  // Track whether initial check has completed — we never show loading again after that
  const initialCheckDone = useRef(false);

  const normalizedRoles = [...allowedRoles].sort();
  const rolesKey = normalizedRoles.join(",");

  useEffect(() => {
    const roles = rolesKey.split(",").filter(Boolean) as AppRole[];

    const checkRoleStatus = async (showLoading = false) => {
      // Only set loading on first check — never on TOKEN_REFRESHED / background checks
      if (showLoading && !initialCheckDone.current) {
        setIsLoading(true);
      }
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setHasRole(false);
          setUserId(null);
          setIsLoading(false);
          initialCheckDone.current = true;
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
        initialCheckDone.current = true;
      }
    };

    // Initial check — show loading spinner
    checkRoleStatus(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // TOKEN_REFRESHED fires on every tab focus — do NOT show loading for it
      // Only re-check role on actual sign-in / sign-out events
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // For sign-out, clear immediately without a DB call
        if (event === "SIGNED_OUT") {
          setHasRole(false);
          setUserId(null);
          setIsLoading(false);
          return;
        }
        // For sign-in/update, silently re-check without flipping isLoading
        checkRoleStatus(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [rolesKey]);

  return { hasRole, isLoading, userId };
};
