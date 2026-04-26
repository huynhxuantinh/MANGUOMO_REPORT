import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getLessonById, grammarLessons, GrammarExercise } from "../data/grammar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  ChevronLeft, ChevronRight, BookMarked, Check, X,
  Lightbulb, BookOpen, Trophy, RotateCcw
} from "lucide-react";

const levelBadge: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  elementary: "bg-blue-100 text-blue-700",
  intermediate: "bg-purple-100 text-purple-700",
  "upper-intermediate": "bg-orange-100 text-orange-700",
};

const levelNameVi: Record<string, string> = {
  beginner: "Cơ bản",
  elementary: "Sơ cấp",
  intermediate: "Trung cấp",
  "upper-intermediate": "Trung-cao cấp",
};

type Tab = "theory" | "exercises";

export function GrammarLesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = id ? getLessonById(id) : undefined;

  const [activeTab, setActiveTab] = useState<Tab>("theory");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [exerciseDone, setExerciseDone] = useState(false);

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Không tìm thấy bài học này</p>
        <Link to="/grammar">
          <Button>Quay lại danh sách ngữ pháp</Button>
        </Link>
      </div>
    );
  }

  // Find adjacent lessons
  const allLessons = grammarLessons;
  const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const currentExercise: GrammarExercise | undefined = lesson.exercises[exerciseIndex];
  const progressPct = lesson.exercises.length > 0
    ? ((exerciseIndex) / lesson.exercises.length) * 100
    : 0;

  const isCorrect = () => {
    if (!currentExercise) return false;
    if (currentExercise.type === "multiple-choice") {
      return selectedOption === currentExercise.answer;
    }
    return userAnswer.trim().toLowerCase() === currentExercise.answer.toLowerCase();
  };

  const handleSubmit = () => {
    if (submitted) return;
    const correct = isCorrect();
    setResults(prev => [...prev, correct]);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (exerciseIndex < lesson.exercises.length - 1) {
      setExerciseIndex(exerciseIndex + 1);
      setUserAnswer("");
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setExerciseDone(true);
    }
  };

  const handleRestartExercises = () => {
    setExerciseIndex(0);
    setUserAnswer("");
    setSelectedOption(null);
    setSubmitted(false);
    setResults([]);
    setExerciseDone(false);
  };

  const correctCount = results.filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb + Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/grammar" className="hover:text-blue-600 flex items-center gap-1">
            <BookMarked className="size-4" />
            Ngữ pháp
          </Link>
          <span>/</span>
          <span className="text-gray-900">{lesson.titleVi}</span>
        </div>
        <div className="flex gap-2">
          {prevLesson && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/grammar/${prevLesson.id}`)} className="gap-1">
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Bài trước</span>
            </Button>
          )}
          {nextLesson && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/grammar/${nextLesson.id}`)} className="gap-1">
              <span className="hidden sm:inline">Bài sau</span>
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Lesson Header */}
      <div className="flex items-start gap-4">
        <div className="text-5xl">{lesson.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge className={`${levelBadge[lesson.level]} border-0`}>
              {levelNameVi[lesson.level]}
            </Badge>
            <Badge variant="outline">{lesson.category}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.titleVi}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{lesson.title}</p>
          <p className="text-gray-600 mt-1">{lesson.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("theory")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "theory"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="size-4" />
          Lý thuyết
        </button>
        <button
          onClick={() => setActiveTab("exercises")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "exercises"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Trophy className="size-4" />
          Bài tập ({lesson.exercises.length})
        </button>
      </div>

      {/* Theory Tab */}
      {activeTab === "theory" && (
        <div className="space-y-6">
          {/* Theory */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-blue-600" />
                Lý thuyết
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {lesson.theory}
              </div>
            </CardContent>
          </Card>

          {/* Structure */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-purple-800">
                <BookMarked className="size-4" />
                Cấu trúc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="font-mono text-sm text-purple-900 whitespace-pre-wrap leading-relaxed bg-white/60 p-4 rounded-lg border border-purple-100">
                {lesson.structure}
              </pre>
            </CardContent>
          </Card>

          {/* Examples */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ví dụ minh họa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lesson.examples.map((ex, i) => (
                <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="font-medium text-blue-900">{ex.english}</p>
                  <p className="text-sm text-blue-700 mt-1">→ {ex.vietnamese}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-amber-800">
                <Lightbulb className="size-4" />
                Lưu ý quan trọng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lesson.notes.map((note, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-900">
                    <span className="shrink-0 text-amber-500 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Go to exercises */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setActiveTab("exercises")}
            >
              <Trophy className="size-5" />
              Làm bài tập ngay
            </Button>
          </div>
        </div>
      )}

      {/* Exercises Tab */}
      {activeTab === "exercises" && (
        <div className="space-y-6">
          {exerciseDone ? (
            // Results screen
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 rounded-full">
                    <Trophy className="size-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">
                  {correctCount === lesson.exercises.length
                    ? "🎉 Hoàn hảo!"
                    : correctCount >= lesson.exercises.length * 0.7
                    ? "👏 Tốt lắm!"
                    : "💪 Cần cố gắng hơn!"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-5xl font-bold text-primary">{correctCount}/{lesson.exercises.length}</p>
                  <p className="text-gray-600 mt-1">
                    Bạn đã trả lời đúng {((correctCount / lesson.exercises.length) * 100).toFixed(0)}% câu hỏi
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <Check className="size-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-green-800">{correctCount}</p>
                    <p className="text-xs text-green-600">Đúng</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <X className="size-5 text-red-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-red-800">{lesson.exercises.length - correctCount}</p>
                    <p className="text-xs text-red-600">Sai</p>
                  </div>
                </div>

                <div className="flex justify-center gap-3 flex-wrap">
                  <Button onClick={handleRestartExercises} className="gap-2">
                    <RotateCcw className="size-4" />
                    Làm lại
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("theory")} className="gap-2">
                    <BookOpen className="size-4" />
                    Xem lý thuyết
                  </Button>
                  {nextLesson && (
                    <Button variant="outline" onClick={() => navigate(`/grammar/${nextLesson.id}`)} className="gap-2">
                      Bài tiếp theo
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Câu {exerciseIndex + 1} / {lesson.exercises.length}</span>
                  <span>
                    Đúng: {results.filter(Boolean).length} | Sai: {results.filter(r => !r).length}
                  </span>
                </div>
                <Progress value={progressPct} className="h-2" />
              </div>

              {/* Exercise Card */}
              {currentExercise && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {currentExercise.type === "multiple-choice" ? "Chọn đáp án đúng" : "Điền vào chỗ trống"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Câu {exerciseIndex + 1}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2 leading-relaxed">
                      {currentExercise.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Multiple choice */}
                    {currentExercise.type === "multiple-choice" && currentExercise.options && (
                      <div className="space-y-2">
                        {currentExercise.options.map((option, i) => {
                          const isSelected = selectedOption === option;
                          const isCorrectOption = option === currentExercise.answer;
                          const showGreen = submitted && isCorrectOption;
                          const showRed = submitted && isSelected && !isCorrectOption;

                          return (
                            <button
                              key={i}
                              disabled={submitted}
                              onClick={() => !submitted && setSelectedOption(option)}
                              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                                showGreen
                                  ? "border-green-500 bg-green-50 text-green-900"
                                  : showRed
                                  ? "border-red-500 bg-red-50 text-red-900"
                                  : isSelected
                                  ? "border-blue-500 bg-blue-50 text-blue-900"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className={`size-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                showGreen ? "border-green-600 bg-green-600" :
                                showRed ? "border-red-500 bg-red-500" :
                                isSelected ? "border-blue-500" : "border-gray-300"
                              }`}>
                                {showGreen && <Check className="size-3 text-white" />}
                                {showRed && <X className="size-3 text-white" />}
                              </div>
                              <span className="text-sm">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill blank */}
                    {currentExercise.type === "fill-blank" && (
                      <div className="space-y-3">
                        <Input
                          value={userAnswer}
                          onChange={e => setUserAnswer(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && !submitted && userAnswer.trim() && handleSubmit()}
                          placeholder="Nhập câu trả lời..."
                          disabled={submitted}
                          className={`text-base ${
                            submitted
                              ? isCorrect()
                                ? "border-green-500 bg-green-50 text-green-900"
                                : "border-red-500 bg-red-50 text-red-900"
                              : ""
                          }`}
                        />
                        {submitted && !isCorrect() && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Đáp án đúng: </span>
                            <span className="text-green-700 font-medium">{currentExercise.answer}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Feedback */}
                    {submitted && (
                      <div className={`rounded-lg p-4 space-y-2 ${isCorrect() ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                        <div className="flex items-center gap-2">
                          {isCorrect() ? (
                            <>
                              <Check className="size-5 text-green-600" />
                              <span className="font-medium text-green-800">Chính xác!</span>
                            </>
                          ) : (
                            <>
                              <X className="size-5 text-red-500" />
                              <span className="font-medium text-red-800">Chưa đúng</span>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{currentExercise.explanation}</p>
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    <div className="flex justify-end gap-2 pt-2">
                      {!submitted ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={
                            currentExercise.type === "multiple-choice"
                              ? !selectedOption
                              : !userAnswer.trim()
                          }
                          className="gap-2"
                        >
                          Kiểm tra
                          <Check className="size-4" />
                        </Button>
                      ) : (
                        <Button onClick={handleNext} className="gap-2">
                          {exerciseIndex < lesson.exercises.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
                          <ChevronRight className="size-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
