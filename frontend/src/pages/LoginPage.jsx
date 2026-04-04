import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import useAuthStore from "../store/authStore";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const [formData, setFormData] = useState({ username: "", password: "" });

  function onInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const ok = await login(formData);
    if (ok) {
      navigate(from, { replace: true });
    }
  }

  return (
    <main className="app-page mx-auto flex min-h-screen max-w-md items-center">
      <section className="app-panel app-glow w-full p-6">
        <h1 className="text-2xl font-bold text-slate-900">Dang nhap</h1>
        <p className="mt-1 text-sm text-slate-600">Nhap tai khoan de su dung app.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={onInputChange}
              required
              className="app-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={onInputChange}
              required
              className="app-input"
            />
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Dang xu ly..." : "Dang nhap"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Chua co tai khoan?{" "}
          <Link to="/register" className="app-link">
            Dang ky
          </Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
