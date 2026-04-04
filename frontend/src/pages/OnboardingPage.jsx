import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchPlacementQuestionsApi,
  setupLearningPathApi,
  submitPlacementAnswersApi,
} from "../api/learning";
import { Button } from "../components/ui/button";

const GOALS = [
  { value: "foundation", label: "Mat goc - hoc lai co ban" },
  { value: "communication", label: "Giao tiep hang ngay" },
  { value: "exam", label: "Luyen thi TOEIC/IELTS" },
  { value: "work", label: "Tieng Anh cong viec" },
];

const LEVELS = ["A1", "A2", "B1", "B2"];

function OnboardingPage() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [placementResult, setPlacementResult] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingPath, setSavingPath] = useState(false);
  const [error, setError] = useState("");

  const [pathForm, setPathForm] = useState({
    current_level: "A1",
    goal: "foundation",
    duration_weeks: 8,
  });

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchPlacementQuestionsApi();
        const incoming = Array.isArray(data?.questions) ? data.questions : [];
        setQuestions(incoming);
      } catch {
        setError("Khong tai duoc bai test dau vao.");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  function onSelectAnswer(wordId, selectedAnswer) {
    setAnswers((prev) => ({
      ...prev,
      [wordId]: selectedAnswer,
    }));
  }

  async function onSubmitPlacement() {
    if (!questions.length) return;
    const payloadAnswers = questions
      .map((question) => ({
        word_id: question.word_id,
        selected_answer: answers[question.word_id] || "",
      }))
      .filter((item) => item.selected_answer);

    if (!payloadAnswers.length) {
      setError("Ban can chon it nhat 1 cau de tiep tuc.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await submitPlacementAnswersApi({ answers: payloadAnswers });
      setPlacementResult(data);
      setPathForm((prev) => ({ ...prev, current_level: data.level || "A1" }));
      setStep(2);
    } catch {
      setError("Khong nop duoc bai test dau vao.");
    } finally {
      setLoading(false);
    }
  }

  async function onSavePath(event) {
    event.preventDefault();
    try {
      setSavingPath(true);
      setError("");
      await setupLearningPathApi({
        current_level: pathForm.current_level,
        goal: pathForm.goal,
        duration_weeks: Number(pathForm.duration_weeks),
      });
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Khong luu duoc lo trinh hoc.");
    } finally {
      setSavingPath(false);
    }
  }

  return (
    <main className="app-page max-w-4xl">
      <section className="app-panel app-glow p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Onboarding - English Learning Hub</h1>
        <p className="mt-1 text-sm text-slate-600">
          Hoan thanh test dau vao va chon muc tieu de he thong goi y lo trinh 4-12 tuan.
        </p>

        {step === 1 ? (
          <div className="mt-6 space-y-4">
            <div className="app-soft-panel px-3 py-2 text-sm text-slate-700">
              Da tra loi: {answeredCount}/{questions.length}
            </div>

            {loading ? <p className="text-sm text-slate-600">Dang tai cau hoi test dau vao...</p> : null}

            {!loading &&
              questions.map((question) => (
                <article key={question.question_id} className="app-soft-panel p-3 sm:p-4">
                  <p className="text-sm font-semibold text-slate-800">{question.prompt}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => {
                      const isSelected = answers[question.word_id] === option;
                      return (
                        <button
                          key={`${question.word_id}-${option}`}
                          type="button"
                          onClick={() => onSelectAnswer(question.word_id, option)}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                              isSelected
                                ? "border-teal-700 bg-teal-50 text-teal-900"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}

            <Button onClick={onSubmitPlacement} disabled={loading || !questions.length}>
              {loading ? "Dang cham bai..." : "Hoan thanh test dau vao"}
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <form className="mt-6 space-y-4" onSubmit={onSavePath}>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800">
                Ket qua: {placementResult?.correct}/{placementResult?.total} cau dung ({placementResult?.score}%)
              </p>
              <p className="mt-1 text-lg font-semibold text-green-900">Trinh do de xuat: {placementResult?.level}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-medium text-slate-700">
                Trinh do
                <select
                  value={pathForm.current_level}
                  onChange={(event) => setPathForm((prev) => ({ ...prev, current_level: event.target.value }))}
                  className="app-select mt-1"
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Muc tieu
                <select
                  value={pathForm.goal}
                  onChange={(event) => setPathForm((prev) => ({ ...prev, goal: event.target.value }))}
                  className="app-select mt-1"
                >
                  {GOALS.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                So tuan
                <select
                  value={pathForm.duration_weeks}
                  onChange={(event) =>
                    setPathForm((prev) => ({ ...prev, duration_weeks: Number(event.target.value) }))
                  }
                  className="app-select mt-1"
                >
                  <option value={4}>4 tuan</option>
                  <option value={8}>8 tuan</option>
                  <option value={12}>12 tuan</option>
                </select>
              </label>
            </div>

            <Button type="submit" disabled={savingPath}>
              {savingPath ? "Dang luu lo trinh..." : "Bat dau hoc ngay"}
            </Button>
          </form>
        ) : null}

        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
      </section>
    </main>
  );
}

export default OnboardingPage;
