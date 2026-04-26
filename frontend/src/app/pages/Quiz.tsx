import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Trophy, Home, RotateCcw, Check, X, Loader2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { studyService, StudyWord, StudySession } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";

interface LocalQuestion {
  word: StudyWord;
  options: string[];
  correctAnswer: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function Quiz() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { isAuthenticated } = useAuth();

  const [session, setSession] = useState<StudySession | null>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [allMeanings, setAllMeanings] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const lessonId = categoryId ? Number(categoryId) : undefined;

  const buildQuestions = (words: StudyWord[]): LocalQuestion[] => {
    const meanings = words.map((w) => w.primary_meaning);
    setAllMeanings(meanings);
    return shuffleArray(words).slice(0, Math.min(10, words.length)).map((word) => {
      const wrong = meanings
        .filter((m) => m !== word.primary_meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = shuffleArray([...wrong, word.primary_meaning]);
      return { word, options, correctAnswer: word.primary_meaning };
    });
  };

  const startQuiz = () => {
    setLoading(true);
    setError("");
    setScore(0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);

    studyService
      .start({ mode: "quiz", limit: 20, lesson_id: lessonId })
      .then((res) => {
        setSession(res.data.session);
        setQuestions(buildQuestions(res.data.questions));
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || "Không thể tải quiz");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      startQuiz();
    } else {
      setLoading(false);
      setError("Vui lòng đăng nhập để làm quiz");
    }
  }, [isAuthenticated, lessonId]);

  const handleAnswerSelect = async (answer: string) => {
    if (showResult || !session) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    const currentQ = questions[currentIndex];
    const isCorrect = answer === currentQ.correctAnswer;
    if (isCorrect) setScore((s) => s + 1);
    try {
      await studyService.answer(session.id, {
        word_id: currentQ.word.id,
        is_correct: isCorrect,
        response_text: answer,
      });
    } catch {}
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center text-gray-400">
        <Loader2 className="size-6 animate-spin mr-2" /> Đang tải quiz...
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-600">{error || "Không có câu hỏi nào"}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"><Button>Trang chủ</Button></Link>
          {isAuthenticated && <Button variant="outline" onClick={startQuiz}>Thử lại</Button>}
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = (score / questions.length) * 100;
    const isPerfect = score === questions.length;
    const isGood = percentage >= 70;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-full">
                <Trophy className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">
              {isPerfect && "🎉 Hoàn hảo!"}
              {!isPerfect && isGood && "👏 Tốt lắm!"}
              {!isPerfect && !isGood && "💪 Cố gắng lên!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-6xl font-bold text-primary">{score}/{questions.length}</p>
              <p className="text-xl text-gray-600">
                Bạn đã trả lời đúng {percentage.toFixed(0)}% câu hỏi
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Check className="size-5" /> <span className="font-semibold">Đúng</span>
                </div>
                <p className="text-2xl font-bold text-green-900 text-center mt-2">{score}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-red-700">
                  <X className="size-5" /> <span className="font-semibold">Sai</span>
                </div>
                <p className="text-2xl font-bold text-red-900 text-center mt-2">{questions.length - score}</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={startQuiz} size="lg" className="gap-2">
                <RotateCcw className="size-4" /> Làm lại
              </Button>
              <Link to="/">
                <Button variant="outline" size="lg" className="gap-2">
                  <Home className="size-4" /> Trang chủ
                </Button>
              </Link>
              <Link to="/progress">
                <Button variant="outline" size="lg" className="gap-2">
                  <Trophy className="size-4" /> Xem tiến độ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Quiz từ vựng</h1>
          <p className="text-gray-600">Kiểm tra kiến thức của bạn</p>
        </div>
        <Link to="/">
          <Button variant="outline" size="icon"><Home className="size-4" /></Button>
        </Link>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Câu {currentIndex + 1} / {questions.length}</span>
          <span className="text-gray-600">Điểm: {score}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            <div className="space-y-3">
              <Badge variant="secondary">Nghĩa của từ này là gì?</Badge>
              <p className="text-4xl font-bold text-primary">{currentQuestion.word.english_word}</p>
              {currentQuestion.word.phonetic && (
                <p className="text-lg text-gray-600">{currentQuestion.word.phonetic}</p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <Button
                key={index}
                variant="outline"
                className={`w-full justify-start text-left h-auto py-4 px-6 ${
                  showCorrect ? "bg-green-100 border-green-500 text-green-900 hover:bg-green-100" :
                  showWrong ? "bg-red-100 border-red-500 text-red-900 hover:bg-red-100" :
                  isSelected ? "bg-blue-50 border-blue-500" : ""
                }`}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`size-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    showCorrect ? "border-green-600 bg-green-600" :
                    showWrong ? "border-red-600 bg-red-600" :
                    isSelected ? "border-blue-600" : "border-gray-300"
                  }`}>
                    {showCorrect && <Check className="size-4 text-white" />}
                    {showWrong && <X className="size-4 text-white" />}
                  </div>
                  <span className="flex-1 text-left">{option}</span>
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Result Feedback */}
      {showResult && (
        <Card className={selectedAnswer === currentQuestion.correctAnswer ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <CardContent className="py-6 space-y-3">
            <div className="text-center">
              <p className="text-xl font-semibold">
                {selectedAnswer === currentQuestion.correctAnswer ? "✅ Chính xác!" : "❌ Chưa đúng"}
              </p>
            </div>
            {currentQuestion.word.examples?.slice(0, 1).map((ex, i) => (
              <div key={i} className="bg-white p-4 rounded-lg space-y-2">
                <p className="font-medium">Ví dụ:</p>
                <p className="text-gray-700 italic">"{ex.sentence_en}"</p>
                <p className="text-sm text-gray-500">{ex.sentence_vi}</p>
              </div>
            ))}
            <div className="text-center pt-2">
              <Button onClick={handleNext} size="lg">
                {currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
