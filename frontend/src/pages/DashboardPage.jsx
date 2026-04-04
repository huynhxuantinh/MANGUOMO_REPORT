import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { addFavoriteLessonApi, fetchFavoriteLessonsApi, removeFavoriteLessonApi } from "../api/favorites";
import { fetchDashboardApi } from "../api/dashboard";
import { fetchLearningTracksApi } from "../api/learning";
import AppNav from "../components/AppNav";
import { Button } from "../components/ui/button";

function KpiCard({ title, value, note, onClickLabel, onClick }) {
  return (
    <article className="app-kpi p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{note}</p>
      {onClick ? (
        <button type="button" className="app-link mt-2 text-xs" onClick={onClick}>
          {onClickLabel}
        </button>
      ) : null}
    </article>
  );
}

function TrackSection({ track, onOpenLesson, favoriteLessonIds, onToggleFavoriteLesson }) {
  return (
    <section className="app-panel p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{track.title}</h2>
          <p className="app-subtle text-sm">
            {track.description} | {track.total_words} TU VUNG
          </p>
        </div>
        <Link to={`/learn/${track.slug}`} className="app-link text-sm">
          Xem tat ca {"->"}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(track.lessons || []).map((lesson) => (
          <article key={lesson.id} className="app-soft-panel p-3">
            <p className="text-xs font-semibold text-slate-500">
              {lesson.learned_words}/{lesson.total_words}
            </p>
            <h3 className="mt-1 min-h-11 text-sm font-semibold text-slate-900">{lesson.title}</h3>
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <Button className="w-full" onClick={() => onOpenLesson(lesson.id)}>
                Hoc ngay
              </Button>
              <Button
                variant={favoriteLessonIds.has(lesson.id) ? "default" : "secondary"}
                size="sm"
                onClick={() => onToggleFavoriteLesson(lesson.id)}
                aria-label={favoriteLessonIds.has(lesson.id) ? "Bo yeu thich section" : "Them yeu thich section"}
              >
                <Heart className={`h-4 w-4 ${favoriteLessonIds.has(lesson.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [favoriteLessonIds, setFavoriteLessonIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [tracksData, dashboardData, favoriteLessons] = await Promise.all([
          fetchLearningTracksApi(),
          fetchDashboardApi(),
          fetchFavoriteLessonsApi(),
        ]);
        setTracks(Array.isArray(tracksData) ? tracksData : []);
        setDashboard(dashboardData);
        setFavoriteLessonIds(new Set((Array.isArray(favoriteLessons) ? favoriteLessons : []).map((item) => item.lesson_id)));
      } catch {
        setError("Khong tai duoc dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function onToggleFavoriteLesson(lessonId) {
    try {
      if (favoriteLessonIds.has(lessonId)) {
        await removeFavoriteLessonApi(lessonId);
        setFavoriteLessonIds((prev) => {
          const next = new Set(prev);
          next.delete(lessonId);
          return next;
        });
      } else {
        await addFavoriteLessonApi(lessonId);
        setFavoriteLessonIds((prev) => {
          const next = new Set(prev);
          next.add(lessonId);
          return next;
        });
      }
    } catch {
      setError("Khong cap nhat duoc section yeu thich.");
    }
  }

  const recommendation = dashboard?.next_recommendation;
  const nextLesson = recommendation?.lesson;
  const weeklyActivity = useMemo(() => dashboard?.weekly_activity || [], [dashboard]);
  const maxWeeklyWords = useMemo(
    () => Math.max(1, ...weeklyActivity.map((item) => item.words_studied || 0)),
    [weeklyActivity]
  );
  const progressByStatus = dashboard?.progress_by_status || {};

  return (
    <main className="app-page">
      <AppNav
        title="Dashboard Hoc Tap"
        subtitle="Nhin nhanh toan bo tien do, bai hoc tiep theo va muc can on tap."
      />

      {loading ? <p className="app-subtle text-sm">Dang tai dashboard...</p> : null}
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {!loading && dashboard ? (
        <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard title="Streak" value={dashboard.summary?.streak_count || 0} note="Ngay hoc lien tiep" />
          <KpiCard title="Accuracy" value={`${dashboard.summary?.accuracy || 0}%`} note="Do chinh xac tra loi" />
          <KpiCard title="Due Review" value={dashboard.summary?.due_words || 0} note="Tu den han SRS" />
          <KpiCard title="Goal / Day" value={dashboard.summary?.daily_goal || 0} note="Muc tieu moi ngay" />
          <KpiCard
            title="So Tay"
            value={dashboard.summary?.favorite_words_count || 0}
            note="Tu yeu thich da luu"
            onClickLabel="Mo so tay"
            onClick={() => navigate("/favorites")}
          />
        </section>
      ) : null}

      {!loading && dashboard ? (
        <div className="mb-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="app-panel app-glow p-4 sm:p-5">
            {!recommendation?.learning_path ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Ban chua tao lo trinh hoc</h2>
                  <p className="app-subtle text-sm">Lam onboarding de he thong de xuat bai hoc phu hop trinh do.</p>
                </div>
                <Button onClick={() => navigate("/onboarding")}>Tao lo trinh</Button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="app-chip mb-2">Hom nay hoc gi?</p>
                    <h2 className="text-xl font-bold text-slate-900">{nextLesson?.title || "Chua co bai hoc"}</h2>
                    <p className="app-subtle text-sm">Goi y theo co che: {recommendation.reason}</p>
                    {dashboard.weak_tags?.length ? (
                      <p className="mt-2 text-xs font-semibold text-amber-700">
                        Can on them: {dashboard.weak_tags.map((item) => item.tag).join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {nextLesson ? (
                      <Button onClick={() => navigate(`/lessons/${nextLesson.id}`)}>Mo bai hoc</Button>
                    ) : null}
                    <Button variant="secondary" onClick={() => navigate("/settings")}>
                      Cai dat
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <article className="app-soft-panel p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Daily Loop (20-40')</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      <li>A. Khoi dong 5 phut (SRS)</li>
                      <li>B. Hoc bai moi 10-15 phut</li>
                      <li>C. Lam quiz 10 phut</li>
                      <li>D. Review loi sai 5-10 phut</li>
                    </ul>
                  </article>
                  <article className="app-soft-panel p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.05em] text-slate-500">Trang Thai Tu Vung</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="app-chip">New: {progressByStatus.new || 0}</span>
                      <span className="app-chip">Learning: {progressByStatus.learning || 0}</span>
                      <span className="app-chip">Review: {progressByStatus.review || 0}</span>
                      <span className="app-chip">Mastered: {progressByStatus.mastered || 0}</span>
                    </div>
                  </article>
                </div>
              </div>
            )}
          </section>

          <aside className="app-panel p-4 sm:p-5">
            <h2 className="text-lg font-bold text-slate-900">Activity 7 Ngay</h2>
            <div className="mt-3 space-y-2">
              {weeklyActivity.map((item) => {
                const ratio = ((item.words_studied || 0) / maxWeeklyWords) * 100;
                return (
                  <div key={item.date}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                      <span>{item.date.slice(5)}</span>
                      <span>{item.words_studied || 0} tu</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#0f6b95_100%)]"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="secondary" className="mt-4 w-full" onClick={() => navigate("/progress")}>
              Xem phan tich chi tiet
            </Button>
          </aside>
        </div>
      ) : null}

      {!loading && dashboard?.recent_sessions?.length ? (
        <section className="app-panel mb-4 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Phien Hoc Gan Day</h2>
            <Button variant="ghost" onClick={() => navigate("/study")}>
              Vao luyen tap
            </Button>
          </div>
          <div className="overflow-auto">
            <table className="app-table min-w-full">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Mode</th>
                  <th>Dung/Tong</th>
                  <th>Accuracy</th>
                  <th>Bat dau</th>
                  <th>Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_sessions.map((session) => (
                  <tr key={session.id}>
                    <td>#{session.id}</td>
                    <td>{session.mode}</td>
                    <td>
                      {session.correct_answers}/{session.total_questions}
                    </td>
                    <td>{session.accuracy}%</td>
                    <td>{new Date(session.started_at).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="app-link text-xs"
                        onClick={() =>
                          navigate(session.lesson_id ? `/study?lessonId=${session.lesson_id}` : "/study")
                        }
                      >
                        Hoc lai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-4">
          {tracks.map((track) => (
            <TrackSection
              key={track.id}
              track={track}
              onOpenLesson={(id) => navigate(`/lessons/${id}`)}
              favoriteLessonIds={favoriteLessonIds}
              onToggleFavoriteLesson={onToggleFavoriteLesson}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}

export default DashboardPage;
