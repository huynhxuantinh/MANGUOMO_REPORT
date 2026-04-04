import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchDashboardApi } from "../api/dashboard";
import { fetchProgressOverviewApi } from "../api/progress";
import AppNav from "../components/AppNav";

function intensityClass(value) {
  if (value >= 20) return "bg-teal-700";
  if (value >= 12) return "bg-teal-500";
  if (value >= 6) return "bg-teal-300";
  if (value > 0) return "bg-teal-100";
  return "bg-slate-100";
}

function ProgressPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [dashboardData, overviewData] = await Promise.all([fetchDashboardApi(), fetchProgressOverviewApi()]);
        setDashboard(dashboardData);
        setOverview(overviewData);
      } catch {
        setError("Khong tai duoc du lieu tien do.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const heatmap = useMemo(() => overview?.heatmap || [], [overview]);
  const weakTags = useMemo(() => overview?.weak_tags || [], [overview]);
  const attempts = useMemo(() => overview?.recent_quiz_attempts || [], [overview]);

  return (
    <main className="app-page">
      <AppNav title="Progress & Analytics" subtitle="Theo doi streak, ket qua quiz va nhan goi y hoc tiep theo." />

      {loading ? <p className="app-subtle text-sm">Dang tai thong ke tien do...</p> : null}
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {!loading && dashboard ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="app-kpi p-4">
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Streak</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{dashboard.summary?.streak_count || 0}</p>
            <p className="text-xs text-slate-500">Ngay hoc lien tiep</p>
          </article>
          <article className="app-kpi p-4">
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Accuracy</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{dashboard.summary?.accuracy || 0}%</p>
            <p className="text-xs text-slate-500">Do chinh xac trung binh</p>
          </article>
          <article className="app-kpi p-4">
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Due Review</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{dashboard.summary?.due_words || 0}</p>
            <p className="text-xs text-slate-500">Tu den han on tap</p>
          </article>
          <article className="app-kpi p-4">
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">Daily Goal</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{dashboard.summary?.daily_goal || 0}</p>
            <p className="text-xs text-slate-500">Muc tieu moi ngay</p>
          </article>
        </section>
      ) : null}

      {!loading && overview ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="app-panel p-4 sm:p-5">
            <h2 className="text-lg font-bold text-slate-900">Heatmap 30 Ngay</h2>
            <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-10">
              {heatmap.map((item) => (
                <div key={item.date}>
                  <div
                    className={`h-7 rounded-md border border-slate-200 ${intensityClass(item.words_studied)}`}
                    title={`${item.date} - ${item.words_studied} words`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Dam mau hon = hoc nhieu hon.</p>
          </section>

          <section className="app-panel p-4 sm:p-5">
            <h2 className="text-lg font-bold text-slate-900">Ky Nang Can On</h2>
            <div className="mt-3 space-y-2">
              {weakTags.length ? (
                weakTags.map((tag) => (
                  <article key={tag.tag} className="app-soft-panel p-3">
                    <p className="text-sm font-semibold text-slate-900">{tag.tag}</p>
                    <p className="text-xs text-slate-600">
                      Accuracy: {tag.accuracy}% ({tag.total} cau)
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-600">Chua co tag yeu ro rang. Tiep tuc lam quiz de he thong danh gia.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {!loading && attempts.length ? (
        <section className="app-panel mt-4 p-4 sm:p-5">
          <h2 className="text-lg font-bold text-slate-900">Quiz Gan Day</h2>
          <div className="mt-3 overflow-auto">
            <table className="app-table min-w-full">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Ket qua</th>
                  <th>Thoi gian</th>
                  <th>Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{attempt.quiz}</td>
                    <td>{attempt.score}%</td>
                    <td className={attempt.passed ? "text-green-700" : "text-red-700"}>
                      {attempt.passed ? "Pass" : "Fail"}
                    </td>
                    <td>{new Date(attempt.started_at).toLocaleString()}</td>
                    <td>
                      <button type="button" className="app-link text-xs" onClick={() => navigate(`/quiz/${attempt.quiz}`)}>
                        Lam lai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default ProgressPage;
