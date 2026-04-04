import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { fetchLessonQuizApi, submitLessonQuizApi } from "../api/learning";
import AppNav from "../components/AppNav";
import { Button } from "../components/ui/button";

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function QuizPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answersByQuestion, setAnswersByQuestion] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIndex] || null;
  const isTextQuestion = currentQuestion && currentQuestion.question_type !== "mcq";
  const isClozeQuestion =
    isTextQuestion && typeof currentQuestion.prompt === "string" && currentQuestion.prompt.includes("______");

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchLessonQuizApi(quizId);
        setQuiz(data);
        setRemainingSeconds(data.time_limit_seconds || 0);
      } catch {
        setError("Khong tai duoc quiz.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || result) return undefined;
    if (remainingSeconds <= 0) return undefined;
    const timerId = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timerId);
  }, [quiz, result, remainingSeconds]);

  useEffect(() => {
    if (!quiz || result || remainingSeconds > 0) return;
    onSubmitQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, quiz, result]);

  const answeredCount = useMemo(() => Object.keys(answersByQuestion).length, [answersByQuestion]);

  function setMcqAnswer(questionId, choiceId) {
    setAnswersByQuestion((prev) => ({
      ...prev,
      [questionId]: { selected_choice_id: choiceId },
    }));
  }

  function setTextAnswer(questionId, textAnswer) {
    setAnswersByQuestion((prev) => ({
      ...prev,
      [questionId]: { text_answer: textAnswer },
    }));
  }

  async function onSubmitQuiz() {
    if (!quiz || submitting) return;
    try {
      setSubmitting(true);
      setError("");
      const answers = questions.map((question) => ({
        question_id: question.id,
        selected_choice_id: answersByQuestion[question.id]?.selected_choice_id || null,
        text_answer: answersByQuestion[question.id]?.text_answer || "",
      }));
      const data = await submitLessonQuizApi(quiz.id, { answers });
      setResult(data);
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 401) {
        setError("Phien dang nhap da het han. Vui long dang nhap lai.");
      } else if (status === 404) {
        setError("Quiz khong con ton tai hoac da thay doi. Vui long tai lai trang.");
      } else if (status === 400 && typeof detail === "string") {
        setError(detail);
      } else {
        setError("Khong nop duoc quiz. Vui long thu lai.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-page max-w-5xl">
      <AppNav title={quiz?.title || "Quiz"} subtitle="Lam tung cau, xem ket qua va giai thich ngay sau khi nop bai." />

      {loading ? <p className="text-sm text-slate-600">Dang tai quiz...</p> : null}
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

      {!loading && quiz && !result ? (
        <section className="app-panel p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700">
              Cau {Math.min(currentIndex + 1, questions.length)}/{questions.length}
            </p>
            <p className={`rounded-full px-3 py-1 text-xs font-semibold ${remainingSeconds < 60 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>
              {formatTimer(remainingSeconds)}
            </p>
          </div>

          {currentQuestion ? (
            <>
              <p className="app-chip mb-2">{currentQuestion.question_type}</p>
              {isClozeQuestion ? (
                <div className="app-soft-panel p-3">
                  <p className="text-sm font-semibold text-slate-800">Dien tu vao cho trong</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{currentQuestion.prompt}</p>
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-slate-900">{currentQuestion.prompt}</h2>
              )}

              {currentQuestion.question_type === "mcq" ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(currentQuestion.choices || []).map((choice) => {
                    const selected = answersByQuestion[currentQuestion.id]?.selected_choice_id === choice.id;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => setMcqAnswer(currentQuestion.id, choice.id)}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                          selected
                            ? "border-teal-700 bg-teal-50 text-teal-900"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {choice.content}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4">
                  <input
                    value={answersByQuestion[currentQuestion.id]?.text_answer || ""}
                    onChange={(event) => setTextAnswer(currentQuestion.id, event.target.value)}
                    placeholder={isClozeQuestion ? "Nhap tu thieu..." : "Nhap cau tra loi..."}
                    className="app-input"
                  />
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))} disabled={currentIndex === 0}>
                  Back
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex >= questions.length - 1}
                >
                  Next
                </Button>
                <Button onClick={onSubmitQuiz} disabled={submitting}>
                  {submitting ? "Dang nop bai..." : "Submit quiz"}
                </Button>
              </div>

              <p className="mt-3 text-xs text-slate-500">Da tra loi: {answeredCount}/{questions.length}</p>
            </>
          ) : null}
        </section>
      ) : null}

      {!loading && result ? (
        <section className="app-panel space-y-4 p-4 sm:p-5">
          <div className="app-soft-panel p-4">
            <h2 className="text-xl font-bold text-slate-900">Ket qua quiz</h2>
            <p className="mt-1 text-sm text-slate-700">
              Diem: <span className="font-semibold">{result.score}%</span> - {result.passed ? "Dat" : "Chua dat"}
            </p>
            <p className="text-sm text-slate-700">
              Dung {result.correct_answers}/{result.total_questions} cau
            </p>
          </div>

          <div className="space-y-3">
            {(result.answers || []).map((item) => (
              <article key={item.question_id} className="app-soft-panel p-3">
                <p className="text-sm font-semibold text-slate-900">{item.question_prompt}</p>
                <p className={`mt-1 text-sm font-semibold ${item.is_correct ? "text-green-700" : "text-red-700"}`}>
                  {item.is_correct ? "Dung" : "Sai"} - +{item.points_awarded} diem
                </p>
                {item.explanation ? <p className="mt-1 text-sm text-slate-600">{item.explanation}</p> : null}
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.location.reload()}>Lam lai quiz</Button>
            <Button asChild variant="secondary">
              <Link to="/dashboard">Ve dashboard</Link>
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default QuizPage;
