import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { addFavoriteLessonApi, fetchFavoriteLessonsApi, removeFavoriteLessonApi } from "../api/favorites";
import { fetchLearningTrackDetailApi } from "../api/learning";
import AppNav from "../components/AppNav";
import { Button } from "../components/ui/button";

function LearnTrackPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [track, setTrack] = useState(null);
  const [favoriteLessonIds, setFavoriteLessonIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [data, favoriteLessons] = await Promise.all([
          fetchLearningTrackDetailApi(slug),
          fetchFavoriteLessonsApi({ track: slug }),
        ]);
        setTrack(data);
        setFavoriteLessonIds(new Set((Array.isArray(favoriteLessons) ? favoriteLessons : []).map((item) => item.lesson_id)));
      } catch {
        setError("Khong tai duoc danh sach bai hoc.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

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

  return (
    <main className="app-page">
      <AppNav title={track?.title || "Danh sach bai hoc"} subtitle={track?.description || "Hoc theo tung bai chi tiet."} />

      <div className="mb-4">
        <Link to="/dashboard" className="app-link text-sm">
          {"<-"} Quay lai trang khoa hoc
        </Link>
      </div>

      {loading ? <p className="app-subtle text-sm">Dang tai danh sach bai hoc...</p> : null}
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(track?.lessons || []).map((lesson) => (
            <article key={lesson.id} className="app-panel p-4">
              <p className="text-xs font-semibold text-slate-500">
                {lesson.learned_words}/{lesson.total_words}
              </p>
              <h3 className="mt-1 min-h-11 text-sm font-semibold text-slate-900">{lesson.title}</h3>
              <div className="mt-3 grid gap-2">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Button className="w-full" onClick={() => navigate(`/lessons/${lesson.id}`)}>
                    Xem bai hoc
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
                <Button variant="secondary" className="w-full" onClick={() => navigate(`/study?lessonId=${lesson.id}`)}>
                  Luyen nhanh
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}

export default LearnTrackPage;
