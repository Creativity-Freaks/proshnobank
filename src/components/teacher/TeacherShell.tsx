import { Outlet } from "react-router-dom";

export default function TeacherShell() {
  return (
    <div className="min-h-screen w-full bg-muted/30">
      <Outlet />
    </div>
  );
}
