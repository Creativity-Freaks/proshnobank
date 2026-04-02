import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";

type StudentRouteProps = {
  children: React.ReactNode;
};

const StudentRoute = ({ children }: StudentRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const { hasRole: isTeacherAccount, isLoading: roleLoading } = useRoleCheck(["admin", "moderator", "teacher"]);
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-bengali">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isTeacherAccount) {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  return children;
};

export default StudentRoute;
