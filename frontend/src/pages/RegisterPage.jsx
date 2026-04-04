import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import useAuthStore from "../store/authStore";

function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  function onInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const ok = await register(formData);
    if (ok) {
      navigate("/login");
    }
  }

  return (
    <main className="app-page mx-auto flex min-h-screen max-w-md items-center">
      <section className="app-panel app-glow w-full p-6">
        <h1 className="text-2xl font-bold text-slate-900">Dang ky</h1>
        <p className="mt-1 text-sm text-slate-600">Tao tai khoan moi de bat dau hoc tu vung.</p>

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
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
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
            {isLoading ? "Dang xu ly..." : "Tao tai khoan"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Da co tai khoan?{" "}
          <Link to="/login" className="app-link">
            Dang nhap
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
