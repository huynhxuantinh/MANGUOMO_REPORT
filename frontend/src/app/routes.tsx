import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { Home } from "./pages/Home";
import { VocabularyLists } from "./pages/VocabularyLists";
import { Flashcards } from "./pages/Flashcards";
import { Quiz } from "./pages/Quiz";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProgressPage } from "./pages/Progress";
import { LearningPath } from "./pages/LearningPath";
import { Grammar } from "./pages/Grammar";
import { GrammarLesson } from "./pages/GrammarLesson";
import { Admin } from "./pages/Admin";
import { Layout } from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Guard: chuyển hướng về /login nếu chưa đăng nhập
function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <Loader2 className="size-6 animate-spin mr-2" /> Đang tải...
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Guard: chuyển hướng về / nếu đã đăng nhập
function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export const router = createBrowserRouter([
  // Public only routes (login/register)
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", Component: Login },
      { path: "/register", Component: Register },
    ],
  },
  // Main layout - public pages
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "vocabulary", Component: VocabularyLists },
      { path: "grammar", Component: Grammar },
      { path: "grammar/:id", Component: GrammarLesson },
      // Private pages (require login)
      {
        element: <PrivateRoute />,
        children: [
          { path: "flashcards/:categoryId", Component: Flashcards },
          { path: "quiz/:categoryId", Component: Quiz },
          { path: "progress", Component: ProgressPage },
          { path: "learning-path", Component: LearningPath },
          { path: "admin", Component: Admin },
        ],
      },
      { path: "*", Component: () => <Navigate to="/" replace /> },
    ],
  },
]);
