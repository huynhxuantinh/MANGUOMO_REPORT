import { BookOpenText, ChartColumnBig, Heart, LogOut, Route, Settings, SpellCheck } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "./ui/button";
import useAuthStore from "../store/authStore";

function navClassName({ isActive }) {
  return [
    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition duration-200",
    isActive
      ? "bg-[linear-gradient(135deg,#0f766e_0%,#0f6b95_100%)] text-white shadow-[0_8px_18px_rgba(15,107,149,0.24)]"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  ].join(" ");
}

function AppNav({ title, subtitle }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const initials = (user?.username || "U").slice(0, 1).toUpperCase();

  return (
    <header className="app-panel app-glow mb-4 p-3 sm:mb-6 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="app-chip mb-2">English Learning Hub</p>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{title}</h1>
          <p className="app-subtle text-sm">{subtitle || `Xin chao, ${user?.username || "user"}.`}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-white font-bold text-slate-700">
            {initials}
          </div>
          <Button variant="secondary" onClick={logout} className="w-full sm:w-auto">
            <LogOut className="h-4 w-4" />
            Dang xuat
          </Button>
        </div>
      </div>

      <nav className="flex flex-wrap gap-2">
        <NavLink to="/dashboard" className={navClassName}>
          <ChartColumnBig className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink to="/progress" className={navClassName}>
          <Route className="h-4 w-4" />
          Tien do
        </NavLink>
        {user?.is_staff ? (
          <NavLink to="/words" className={navClassName}>
            <BookOpenText className="h-4 w-4" />
            Tu vung
          </NavLink>
        ) : null}
        <NavLink to="/study" className={navClassName}>
          <SpellCheck className="h-4 w-4" />
          Luyen tap
        </NavLink>
        <NavLink to="/favorites" className={navClassName}>
          <Heart className="h-4 w-4" />
          So tay
        </NavLink>
        <NavLink to="/settings" className={navClassName}>
          <Settings className="h-4 w-4" />
          Ca nhan
        </NavLink>
      </nav>
    </header>
  );
}

export default AppNav;
