import { Outlet } from "react-router-dom";

export default function TeacherShell() {
  return (
    <div className="min-h-[100dvh] w-full bg-muted/30 font-bengali">
      <Outlet />
    </div>
  );
}
