import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  fetchFavoriteLessonsApi,
  fetchFavoriteWordsApi,
  removeFavoriteLessonApi,
  removeFavoriteWordApi,
} from "../api/favorites";
import AppNav from "../components/AppNav";
import { Button } from "../components/ui/button";

function FavoritesPage() {
  const navigate = useNavigate();
  const [favoriteWords, setFavoriteWords] = useState([]);
  const [favoriteLessons, setFavoriteLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadFavorites("");
  }, []);

  async function loadFavorites(searchValue) {
    try {
      setLoading(true);
      setError("");
      const [wordData, lessonData] = await Promise.all([
        fetchFavoriteWordsApi(searchValue ? { search: searchValue } : {}),
        fetchFavoriteLessonsApi(),
      ]);
      setFavoriteWords(Array.isArray(wordData) ? wordData : []);
      setFavoriteLessons(Array.isArray(lessonData) ? lessonData : []);
    } catch {
      setError("Khong tai duoc so tay tu vung.");
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(event) {
    event.preventDefault();
    await loadFavorites(search);
  }

  async function onRemove(wordId) {
    try {
      await removeFavoriteWordApi(wordId);
      await loadFavorites(search);
    } catch {
      setError("Khong xoa duoc tu khoi so tay.");
    }
  }

  async function onRemoveLesson(lessonId) {
    try {
      await removeFavoriteLessonApi(lessonId);
      await loadFavorites(search);
    } catch {
      setError("Khong xoa duoc section khoi so tay.");
    }
  }

  const totalWords = useMemo(() => favoriteWords.length, [favoriteWords]);
  const totalLessons = useMemo(() => favoriteLessons.length, [favoriteLessons]);

  const lessonSections = useMemo(() => {
    const trackMap = new Map();

    for (const item of favoriteLessons) {
      const trackSlug = item.track_slug || "__manual__";
      if (!trackMap.has(trackSlug)) {
        trackMap.set(trackSlug, {
          trackSlug: item.track_slug || "",
          trackTitle: item.track_title || "Section ca nhan",
          lessons: [],
        });
      }
      trackMap.get(trackSlug).lessons.push(item);
    }

    return Array.from(trackMap.values())
      .map((section) => ({
        ...section,
        lessons: section.lessons.sort((a, b) => (a.lesson_order || 0) - (b.lesson_order || 0)),
      }))
      .sort((a, b) => a.trackTitle.localeCompare(b.trackTitle));
  }, [favoriteLessons]);

  const sections = useMemo(() => {
    const trackMap = new Map();

    for (const item of favoriteWords) {
      const trackSlug = item.track_slug || "__manual__";
      if (!trackMap.has(trackSlug)) {
        trackMap.set(trackSlug, {
          trackSlug: item.track_slug || "",
          trackTitle: item.track_title || "So tay ca nhan",
          lessonsMap: new Map(),
          wordsCount: 0,
        });
      }
      const track = trackMap.get(trackSlug);
      track.wordsCount += 1;

      const lessonKey = item.lesson_id || "__manual_lesson__";
      if (!track.lessonsMap.has(lessonKey)) {
        track.lessonsMap.set(lessonKey, {
          lessonId: item.lesson_id || null,
          lessonTitle: item.lesson_title || "Tu da luu thu cong",
          lessonTotalWords: item.lesson_total_words || 0,
          words: [],
        });
      }
      track.lessonsMap.get(lessonKey).words.push(item);
    }

    return Array.from(trackMap.values())
      .map((track) => ({
        ...track,
        lessons: Array.from(track.lessonsMap.values()).sort((a, b) => a.lessonTitle.localeCompare(b.lessonTitle)),
      }))
      .sort((a, b) => a.trackTitle.localeCompare(b.trackTitle));
  }, [favoriteWords]);

  return (
    <main className="app-page">
      <AppNav
        title="So Tay Tu Vung"
        subtitle="Luu ca section bai hoc va tu vung de quay lai hoc ngay."
      />

      <section className="app-panel mb-4 p-4 sm:p-5">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-600">Tong so tu da luu</p>
            <p className="text-3xl font-extrabold text-slate-900">{totalWords}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Tong so section da luu</p>
            <p className="text-3xl font-extrabold text-slate-900">{totalLessons}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate("/study")}>
            Luyen tap ngay
          </Button>
          <Button onClick={() => navigate("/progress")}>Xem tien do</Button>
        </div>

        <form className="mb-2 flex flex-col gap-2 sm:flex-row" onSubmit={onSearch}>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tim trong so tay..."
              className="app-input pl-9"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Tim
          </Button>
        </form>

        {loading ? <p className="app-subtle text-sm">Dang tai so tay...</p> : null}
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      </section>

      {!loading && lessonSections.length ? (
        <section className="app-panel mb-4 p-4 sm:p-5">
          <h3 className="mb-3 text-lg font-bold text-slate-900">Section yeu thich</h3>
          <div className="space-y-4">
            {lessonSections.map((section) => (
              <article key={section.trackSlug || section.trackTitle}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{section.trackTitle}</h4>
                    <p className="app-subtle text-sm">{section.lessons.length} bai dang duoc luu</p>
                  </div>
                  {section.trackSlug ? (
                    <button type="button" className="app-link text-sm" onClick={() => navigate(`/learn/${section.trackSlug}`)}>
                      Xem track {"->"}
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {section.lessons.map((lesson) => (
                    <article key={lesson.lesson_id} className="app-soft-panel p-3">
                      <p className="text-xs font-semibold text-slate-500">0/{lesson.lesson_total_words || 0}</p>
                      <h5 className="mt-1 min-h-11 text-sm font-semibold text-slate-900">{lesson.lesson_title}</h5>
                      <div className="mt-3 grid gap-2">
                        <Button className="w-full" onClick={() => navigate(`/study?lessonId=${lesson.lesson_id}`)}>
                          Hoc ngay
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/lessons/${lesson.lesson_id}`)}>
                          Mo bai hoc
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onRemoveLesson(lesson.lesson_id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                          Bo luu section
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!loading &&
        sections.map((section) => (
          <section key={section.trackSlug || section.trackTitle} className="app-panel mb-4 p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{section.trackTitle}</h2>
                <p className="app-subtle text-sm">{section.wordsCount} tu da luu</p>
              </div>
              {section.trackSlug ? (
                <button type="button" className="app-link text-sm" onClick={() => navigate(`/learn/${section.trackSlug}`)}>
                  Xem tat ca {"->"}
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {section.lessons.map((lesson) => {
                const learned = lesson.words.length;
                const totalWords = Math.max(lesson.lessonTotalWords || learned, learned);
                return (
                  <article key={`${section.trackSlug}-${lesson.lessonId || lesson.lessonTitle}`} className="app-soft-panel p-3">
                    <p className="text-xs font-semibold text-slate-500">
                      {learned}/{totalWords}
                    </p>
                    <h3 className="mt-1 min-h-11 text-sm font-semibold text-slate-900">{lesson.lessonTitle}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {lesson.words
                        .slice(0, 3)
                        .map((item) => item.english_word)
                        .join(", ")}
                    </p>
                    <div className="mt-3 grid gap-2">
                      <Button
                        className="w-full"
                        onClick={() => navigate(lesson.lessonId ? `/study?lessonId=${lesson.lessonId}` : "/study")}
                      >
                        Hoc ngay
                      </Button>
                      {lesson.lessonId ? (
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/lessons/${lesson.lessonId}`)}>
                          Mo bai hoc
                        </Button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

      {!loading && favoriteWords.length ? (
        <section className="app-panel p-4 sm:p-5">
          <h3 className="mb-3 text-lg font-bold text-slate-900">Quan ly tu trong so tay</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteWords.map((item) => (
              <article key={item.word_id} className="app-soft-panel p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-base font-semibold text-slate-900">{item.english_word}</h4>
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </div>
                <p className="text-sm text-slate-700">{item.primary_meaning}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.part_of_speech} | {item.difficulty_level}
                </p>
                <div className="mt-3">
                  <Button size="sm" variant="ghost" onClick={() => onRemove(item.word_id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                    Bo luu
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !favoriteWords.length && !favoriteLessons.length ? (
        <p className="app-subtle text-sm">So tay dang rong. Hay luu them section hoac tu moi.</p>
      ) : null}
    </main>
  );
}

export default FavoritesPage;
