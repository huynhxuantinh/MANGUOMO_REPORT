import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { startStudySessionApi, submitStudyAnswerApi } from "../api/study";
import AppNav from "../components/AppNav";
import { Button } from "../components/ui/button";

function StudyPage() {
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get("lessonId");

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = questions[currentIndex] || null;
  const progressText = useMemo(() => {
    if (!questions.length) return "0/0";
    return `${Math.min(currentIndex + 1, questions.length)}/${questions.length}`;
  }, [currentIndex, questions.length]);

  async function onStartSession(customLessonId = lessonId) {
    try {
      setLoading(true);
      setError("");
      setFeedback(null);
      const payload = { limit: 10, mode: "typing" };
      if (customLessonId) {
        payload.lesson_id = Number(customLessonId);
      }
      const data = await startStudySessionApi(payload);
      setSession(data.session);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setAnswerText("");
    } catch {
      setError("Khong the bat dau phien hoc.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitAnswer(event) {
    event.preventDefault();
    if (!session || !currentQuestion) return;

    try {
      setLoading(true);
      setError("");
      const started = Date.now();
      const data = await submitStudyAnswerApi(session.id, {
        word_id: currentQuestion.id,
        response_text: answerText,
        response_time_ms: Math.max(1, Date.now() - started),
      });
      setFeedback(data);
      setSession((prev) => ({ ...prev, ...data.session }));
    } catch {
      setError("Gui dap an that bai.");
    } finally {
      setLoading(false);
    }
  }

  function onNextQuestion() {
    setFeedback(null);
    setAnswerText("");
    setCurrentIndex((prev) => prev + 1);
  }

  const sessionDone = Boolean(session?.ended_at) || currentIndex >= questions.length;

  useEffect(() => {
    if (lessonId) {
      onStartSession(lessonId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  return (
    <main className="app-page max-w-4xl">
      <AppNav title="Luyen tap tu vung" subtitle="Lam bai theo session, he thong se cap nhat tien do tu dong." />

      {!session ? (
        <section className="app-panel p-6">
          <h2 className="text-xl font-semibold text-slate-900">Bat dau phien hoc moi</h2>
          <p className="mt-2 text-sm text-slate-600">
            {lessonId
              ? "Dang bat dau session tu bai hoc da chon."
              : "Ban se hoc 10 tu moi phien (uu tien tu den han on tap)."}
          </p>
          <Button className="mt-5" onClick={onStartSession} disabled={loading}>
            {loading ? "Dang tao session..." : "Bat dau hoc"}
          </Button>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>
      ) : null}

      {session && !sessionDone && currentQuestion ? (
        <section className="app-panel space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Session #{session.id}</h2>
            <p className="text-sm text-slate-600">{progressText}</p>
          </div>

          <div className="app-soft-panel p-4">
            <p className="text-sm text-slate-600">Tu can tra loi</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{currentQuestion.english_word}</p>
            <p className="mt-1 text-sm text-slate-500">
              {currentQuestion.part_of_speech} | {currentQuestion.difficulty_level}
            </p>
          </div>

          {!feedback ? (
            <form onSubmit={onSubmitAnswer} className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Nhap nghia tieng Viet</label>
              <input
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                required
                className="app-input"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Dang cham..." : "Nop dap an"}
              </Button>
            </form>
          ) : (
            <div className="app-soft-panel space-y-3 p-4">
              <p className={`font-semibold ${feedback.is_correct ? "text-green-700" : "text-red-700"}`}>
                {feedback.is_correct ? "Chinh xac!" : "Chua dung."}
              </p>
              <p className="text-sm text-slate-600">
                Dap an chap nhan: {(feedback.accepted_meanings || []).join(", ")}
              </p>
              <p className="text-sm text-slate-600">
                Tien do: {feedback.progress?.status} - due sau {feedback.progress?.interval_days} ngay
              </p>
              <Button onClick={onNextQuestion}>
                {currentIndex + 1 >= questions.length ? "Ket thuc phien hoc" : "Cau tiep theo"}
              </Button>
            </div>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </section>
      ) : null}

      {session && sessionDone ? (
        <section className="app-panel p-6">
          <h2 className="text-xl font-semibold text-slate-900">Hoan thanh session</h2>
          <p className="mt-2 text-sm text-slate-700">
            Ket qua: {session.correct_answers}/{session.total_questions} cau dung.
          </p>
          <Button className="mt-4" onClick={onStartSession}>
            Bat dau session moi
          </Button>
        </section>
      ) : null}
    </main>
  );
}

export default StudyPage;
