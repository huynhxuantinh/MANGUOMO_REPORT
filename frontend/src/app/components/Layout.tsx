import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  Home, BookOpen, Map, TrendingUp, BookMarked,
  LogIn, UserPlus, LogOut, Shield, Menu, X, ChevronDown
} from "lucide-react";

const navItems = [
  { name: "Trang chủ", path: "/", icon: Home, exact: true },
  { name: "Từ vựng", path: "/vocabulary", icon: BookOpen },
  { name: "Ngữ pháp", path: "/grammar", icon: BookMarked },
  { name: "Lộ trình", path: "/learning-path", icon: Map },
  { name: "Tiến độ", path: "/progress", icon: TrendingUp },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <BookOpen className="size-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                English Learning Hub
              </span>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent sm:hidden">
                ELHub
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={active ? "default" : "ghost"}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Icon className="size-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link to="/admin">
                  <Button
                    variant={isActive("/admin") ? "default" : "ghost"}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Shield className="size-4" />
                    Admin
                  </Button>
                </Link>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="size-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm text-gray-700 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <ChevronDown className="size-3 text-gray-400 hidden sm:block" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              <Shield className="size-3" /> Admin
                            </span>
                          )}
                        </div>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)}>
                            <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                              <Shield className="size-4 text-purple-600" />
                              Trang Admin
                            </div>
                          </Link>
                        )}
                        <Link to="/progress" onClick={() => setUserMenuOpen(false)}>
                          <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                            <TrendingUp className="size-4 text-blue-600" />
                            Tiến độ của tôi
                          </div>
                        </Link>
                        <div
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100"
                        >
                          <LogOut className="size-4" />
                          Đăng xuất
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <LogIn className="size-4" />
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="gap-1.5">
                      <UserPlus className="size-4" />
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive("/admin") ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Shield className="size-4" />
                  <span className="text-sm">Trang Admin</span>
                </Link>
              )}
              {!isAuthenticated && (
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button variant="outline" className="w-full gap-2" size="sm">
                      <LogIn className="size-4" />
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                    <Button className="w-full gap-2" size="sm">
                      <UserPlus className="size-4" />
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="size-4" />
                    <span className="text-sm">Đăng xuất ({user?.name})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2026 English Learning Hub - Học tiếng Anh hiệu quả
            </p>
            <div className="flex gap-4 text-sm text-gray-500">
              <Link to="/vocabulary" className="hover:text-blue-600 transition-colors">Từ vựng</Link>
              <Link to="/grammar" className="hover:text-blue-600 transition-colors">Ngữ pháp</Link>
              <Link to="/learning-path" className="hover:text-blue-600 transition-colors">Lộ trình</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
