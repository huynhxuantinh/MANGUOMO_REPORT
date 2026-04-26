import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, Check, X, Home, Loader2 } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { studyService, StudyWord, StudySession } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";

export function Flashcards() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { isAuthenticated } = useAuth();

  const [session, setSession] = useState<StudySession | null>(null);
  const [words, setWords] = useState<StudyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const lessonId = categoryId ? Number(categoryId) : undefined;

  const startSession = () => {
    setLoading(true);
    setError("");
    studyService
      .start({ mode: "flashcard", limit: 20, lesson_id: lessonId })
      .then((res) => {
        setSession(res.data.session);
        setWords(res.data.questions);
        setCurrentIndex(0);
        setIsFlipped(false);
        setShowResult(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || "Không thể tải flashcards");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated) {
      startSession();
    } else {
      setLoading(false);
      setError("Vui lòng đăng nhập để học flashcards");
    }
  }, [isAuthenticated, lessonId]);

  useEffect(() => {
    setIsFlipped(false);
    setShowResult(false);
  }, [currentIndex]);

  const currentWord = words[currentIndex];

  const handleFlip = () => setIsFlipped(!isFlipped);
  const handleNext = () => { if (currentIndex < words.length - 1) setCurrentIndex(currentIndex + 1); };
  const handlePrevious = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const handleReset = () => { setCurrentIndex(0); setIsFlipped(false); setShowResult(false); };

  const submitAnswer = async (isCorrect: boolean) => {
    if (!session || !currentWord) return;
    setShowResult(true);
    try {
      await studyService.answer(session.id, { word_id: currentWord.id, is_correct: isCorrect });
    } catch {}
    setTimeout(() => {
      if (currentIndex < words.length - 1) setCurrentIndex(currentIndex + 1);
    }, 500);
  };

  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center text-gray-400">
        <Loader2 className="size-6 animate-spin mr-2" /> Đang tải flashcards...
      </div>
    );
  }

  if (error || words.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-600">{error || "Không có từ vựng để học"}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"><Button>Quay về trang chủ</Button></Link>
          {isAuthenticated && <Button variant="outline" onClick={startSession}>Thử lại</Button>}
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-gray-600">Ôn luyện từ vựng với SRS</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={startSession} className="gap-2">
            <RotateCcw className="size-4" /> Phiên mới
          </Button>
          <Link to="/">
            <Button variant="outline" size="icon"><Home className="size-4" /></Button>
          </Link>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Thẻ {currentIndex + 1} / {words.length}</span>
          {session && (
            <span className="text-gray-600">
              Đúng: {session.correct_answers} / {currentIndex}
            </span>
          )}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="perspective-1000">
        <div
          className={`relative w-full aspect-[3/2] transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={handleFlip}
        >
          {/* Front */}
          <Card className={`absolute inset-0 backface-hidden shadow-xl ${isFlipped ? "pointer-events-none" : ""}`}>
            <CardContent className="flex flex-col items-center justify-center h-full p-8 space-y-6">
              <Badge variant="secondary" className="text-sm">Nhấp để lật thẻ</Badge>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-5xl font-bold">{currentWord.english_word}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); speakWord(currentWord.english_word); }}
                  >
                    <Volume2 className="size-6" />
                  </Button>
                </div>
                {currentWord.phonetic && (
                  <p className="text-xl text-gray-600">{currentWord.phonetic}</p>
                )}
                <Badge>{currentWord.part_of_speech}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Back */}
          <Card className={`absolute inset-0 backface-hidden rotate-y-180 shadow-xl ${!isFlipped ? "pointer-events-none" : ""}`}>
            <CardContent className="flex flex-col items-center justify-center h-full p-8 space-y-4">
              <Badge variant="secondary" className="text-sm">Nhấp để lật lại</Badge>
              <div className="text-center space-y-4 max-w-lg">
                <p className="text-xl font-medium">{currentWord.primary_meaning}</p>
                {currentWord.examples?.slice(0, 1).map((ex, i) => (
                  <div key={i} className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700 italic">"{ex.sentence_en}"</p>
                    <p className="text-sm text-gray-500 mt-1">{ex.sentence_vi}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SRS Controls */}
      {isFlipped && !showResult && (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => submitAnswer(false)}
            className="gap-2 border-red-200 hover:bg-red-50"
          >
            <X className="size-5" /> Chưa biết
          </Button>
          <Button
            size="lg"
            onClick={() => submitAnswer(true)}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="size-5" /> Đã biết
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0} className="gap-2">
          <ChevronLeft className="size-4" /> Trước
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="size-4" /> Bắt đầu lại
        </Button>
        <Button variant="outline" onClick={handleNext} disabled={currentIndex === words.length - 1} className="gap-2">
          Sau <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Completion */}
      {currentIndex === words.length - 1 && isFlipped && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="py-6 text-center space-y-2">
            <p className="text-xl font-semibold">🎉 Bạn đã hoàn thành tất cả flashcards!</p>
            <p>Hệ thống SRS đã ghi nhận kết quả của bạn</p>
            <div className="pt-2 flex gap-3 justify-center">
              <Button variant="secondary" onClick={startSession}>Phiên mới</Button>
              <Link to="/progress">
                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Xem tiến độ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
