import { useEffect, useState } from "react";

import { fetchMyProfileApi, updateMyProfileApi } from "../api/profile";
import AppNav from "../components/AppNav";
import { Button } from "../components/ui/button";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const GOALS = [
  { value: "foundation", label: "Mat goc" },
  { value: "communication", label: "Giao tiep" },
  { value: "exam", label: "Luyen thi" },
  { value: "work", label: "Cong viec" },
];

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    avatar_url: "",
    daily_goal: 20,
    current_level: "A1",
    learning_goal: "foundation",
  });
  const [reminderTime, setReminderTime] = useState("20:00");
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchMyProfileApi();
        setProfile(data);
        setForm({
          avatar_url: data.avatar_url || "",
          daily_goal: data.daily_goal || 20,
          current_level: data.current_level || "A1",
          learning_goal: data.learning_goal || "foundation",
        });
      } catch {
        setError("Khong tai duoc profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function onFieldChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "daily_goal" ? Number(value) : value,
    }));
  }

  async function onSave(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload = {
        avatar_url: form.avatar_url,
        daily_goal: Number(form.daily_goal),
        current_level: form.current_level,
        learning_goal: form.learning_goal,
      };
      const data = await updateMyProfileApi(payload);
      setProfile(data);
      setSuccess("Da cap nhat thong tin ca nhan.");
    } catch {
      setError("Luu profile that bai.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-page">
      <AppNav title="Ca Nhan & Cai Dat" subtitle="Tinh chinh muc tieu hoc va nhac hoc theo nhiep do rieng." />

      {loading ? <p className="app-subtle text-sm">Dang tai profile...</p> : null}
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {!loading && profile ? (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="app-panel app-glow p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-slate-300 bg-white text-xl font-bold text-slate-700">
                {(profile.username || "U").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Thong tin hoc vien</h2>
                <p className="app-subtle text-sm">
                  {profile.username} ({profile.email || "no-email"})
                </p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={onSave}>
              <label className="block text-sm font-medium text-slate-700">
                Avatar URL
                <input
                  name="avatar_url"
                  value={form.avatar_url}
                  onChange={onFieldChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="app-input mt-1"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium text-slate-700">
                  Daily goal
                  <input
                    name="daily_goal"
                    type="number"
                    min={1}
                    max={200}
                    value={form.daily_goal}
                    onChange={onFieldChange}
                    className="app-input mt-1"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Level
                  <select name="current_level" value={form.current_level} onChange={onFieldChange} className="app-select mt-1">
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Goal
                  <select name="learning_goal" value={form.learning_goal} onChange={onFieldChange} className="app-select mt-1">
                    {GOALS.map((goal) => (
                      <option key={goal.value} value={goal.value}>
                        {goal.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Dang luu..." : "Luu thay doi"}
              </Button>
              {success ? <p className="text-sm font-semibold text-emerald-700">{success}</p> : null}
            </form>
          </section>

          <aside className="space-y-4">
            <section className="app-panel p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900">Onboarding status</h3>
              <p className="app-subtle mt-2 text-sm">
                {profile.onboarding_completed ? "Da hoan thanh onboarding." : "Chua hoan thanh onboarding."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="app-chip">Streak: {profile.streak_count} ngay</span>
                <span className="app-chip">Active: {profile.last_active_date || "chua co"}</span>
              </div>
            </section>

            <section className="app-panel p-4 sm:p-5">
              <h3 className="text-base font-bold text-slate-900">Thong bao hoc tap</h3>
              <div className="app-soft-panel mt-3 flex items-center justify-between px-3 py-2">
                <span className="text-sm text-slate-700">Bat thong bao nhac hoc</span>
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={(event) => setNotificationEnabled(event.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <label className="mt-3 block text-sm font-medium text-slate-700">
                Gio nhac hoc
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(event) => setReminderTime(event.target.value)}
                  className="app-input mt-1"
                />
              </label>
              <p className="mt-2 text-xs text-slate-500">Thong bao dang luu local UI de test flow nhanh.</p>
            </section>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

export default SettingsPage;
