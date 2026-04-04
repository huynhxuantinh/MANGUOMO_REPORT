import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { addFavoriteLessonApi, fetchFavoriteLessonsApi, removeFavoriteLessonApi } from "../api/favorites";
import { fetchLearningLessonDetailApi } from "../api/learning";
import AppNav from "../components/AppNav";
import { Button } from "../components/ui/button";

function LessonDetailPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [deckWords, setDeckWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flippedWordIds, setFlippedWordIds] = useState(() => new Set());
  const [isFavoriteLesson, setIsFavoriteLesson] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        setError("");
        const [data, favoriteLessons] = await Promise.all([
          fetchLearningLessonDetailApi(lessonId),
          fetchFavoriteLessonsApi(),
        ]);
        setLesson(data);
        setDeckWords(Array.isArray(data?.key_words) ? data.key_words : []);
        setFlippedWordIds(new Set());
        const lessonIds = new Set((Array.isArray(favoriteLessons) ? favoriteLessons : []).map((item) => item.lesson_id));
        setIsFavoriteLesson(lessonIds.has(Number(lessonId)));
      } catch {
        setError("Khong tai duoc chi tiet bai hoc.");
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  async function onToggleFavoriteLesson() {
    if (!lesson) return;
    try {
      if (isFavoriteLesson) {
        await removeFavoriteLessonApi(lesson.id);
        setIsFavoriteLesson(false);
      } else {
        await addFavoriteLessonApi(lesson.id);
        setIsFavoriteLesson(true);
      }
    } catch {
      setError("Khong cap nhat duoc section yeu thich.");
    }
  }

  function onStartQuiz() {
    const firstQuizId = lesson?.quizzes?.[0]?.id;
    if (!firstQuizId) return;
    navigate(`/quiz/${firstQuizId}`);
  }

  function onPracticeLessonWords() {
    navigate(`/study?lessonId=${lessonId}`);
  }

  function onFlipWord(wordId) {
    setFlippedWordIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  }

  function onFlipAllWords() {
    setFlippedWordIds(new Set(deckWords.map((word) => word.id)));
  }

  function onResetFlips() {
    setFlippedWordIds(new Set());
  }

  function onShuffleDeck() {
    setDeckWords((prev) => {
      const next = [...prev];
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = next[i];
        next[i] = next[j];
        next[j] = temp;
      }
      return next;
    });
  }

  const flippedCount = useMemo(
    () => deckWords.reduce((acc, word) => acc + (flippedWordIds.has(word.id) ? 1 : 0), 0),
    [deckWords, flippedWordIds]
  );
  const completionPercent = useMemo(
    () => Math.round((flippedCount / Math.max(deckWords.length, 1)) * 100),
    [deckWords.length, flippedCount]
  );

  return (
    <main className="app-page">
      <AppNav title={lesson?.title || "Chi tiet bai hoc"} subtitle="Ly thuyet ngan gon, tu khoa va quiz tong ket." />

      <div className="mb-4">
        <Link to={lesson?.track_slug ? `/learn/${lesson.track_slug}` : "/dashboard"} className="app-link text-sm">
          {"<-"} Quay lai danh sach bai hoc
        </Link>
      </div>

      {loading ? <p className="text-sm text-slate-600">Dang tai noi dung bai hoc...</p> : null}
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {!loading && lesson ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="app-panel p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="app-chip">{lesson.track_title}</span>
              <span className="app-chip">{lesson.skill_focus || "general"}</span>
              <span className="app-chip">{lesson.estimated_minutes} phut</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">Noi dung bai hoc</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {lesson.theory_content || "Noi dung ly thuyet se duoc cap nhat them."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={onStartQuiz} disabled={!lesson.quizzes?.length}>
                Lam quiz ngay
              </Button>
              <Button variant="secondary" onClick={onPracticeLessonWords}>
                On tu vung trong bai
              </Button>
              <Button variant={isFavoriteLesson ? "default" : "outline"} onClick={onToggleFavoriteLesson}>
                <Heart className={`h-4 w-4 ${isFavoriteLesson ? "fill-current" : ""}`} />
                {isFavoriteLesson ? "Da luu section" : "Luu section"}
              </Button>
            </div>
          </section>

          <aside className="app-panel p-4 sm:p-5">
            <h3 className="text-lg font-semibold text-slate-900">Tien do bai hoc</h3>
            <p className="mt-1 text-sm text-slate-600">
              {lesson.learned_words}/{lesson.total_words} tu da hoc
            </p>
            <p className="text-sm text-slate-600">{lesson.mastered_words} tu da mastered</p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#0f6b95_100%)]"
                style={{ width: `${Math.min(100, (lesson.learned_words / Math.max(lesson.total_words, 1)) * 100)}%` }}
              />
            </div>

            <h4 className="mt-5 text-sm font-semibold text-slate-900">Quiz trong bai</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {(lesson.quizzes || []).map((quiz) => (
                <li key={quiz.id} className="app-soft-panel p-2">
                  <p className="font-semibold">{quiz.title}</p>
                  <p className="text-xs text-slate-500">
                    Pass {quiz.pass_score}% - {quiz.questions?.length || 0} cau
                  </p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      ) : null}

      {!loading && lesson ? (
        <section className="app-panel app-glow mt-4 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Flashcards Vocabulary</h3>
              <p className="text-xs text-slate-500">Cham vao the de lat. Dung de on nhanh truoc khi lam quiz.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={onFlipAllWords} disabled={!deckWords.length}>
                Lat tat ca
              </Button>
              <Button size="sm" variant="secondary" onClick={onResetFlips} disabled={!deckWords.length}>
                Up tat ca
              </Button>
              <Button size="sm" variant="secondary" onClick={onShuffleDeck} disabled={!deckWords.length}>
                Tron the
              </Button>
            </div>
          </div>

          <div className="app-soft-panel mb-3 p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
              <span>
                Da lat {flippedCount}/{deckWords.length} the
              </span>
              <span>{completionPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e_0%,#0f6b95_100%)] transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {deckWords.map((word) => (
              <button
                key={word.id}
                type="button"
                className={`app-flip ${flippedWordIds.has(word.id) ? "is-flipped" : ""}`}
                onClick={() => onFlipWord(word.id)}
                aria-pressed={flippedWordIds.has(word.id)}
              >
                <span className="app-flip-inner">
                  <span className="app-flip-face app-flip-front p-3">
                    <span className="text-sm font-semibold text-slate-900">{word.english_word}</span>
                    <span className="mt-2 text-xs text-slate-500">Tap to flip</span>
                  </span>
                  <span className="app-flip-face app-flip-back p-3">
                    <span className="text-sm font-semibold text-slate-900">{word.primary_meaning}</span>
                    <span className="mt-2 text-xs text-slate-600">
                      {word.part_of_speech} - {word.difficulty_level}
                    </span>
                    {word.pronunciation ? <span className="mt-1 text-xs text-slate-500">{word.pronunciation}</span> : null}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {!deckWords.length ? <p className="text-sm text-slate-500">Bai hoc nay chua co key vocabulary.</p> : null}
        </section>
      ) : null}
    </main>
  );
}

export default LessonDetailPage;
