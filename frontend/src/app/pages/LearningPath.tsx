import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { learningService, LearningTrack } from "../lib/services";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import {
  BookOpen, Brain, Trophy, Clock, Star, Lock, CheckCircle2,
  ChevronRight, Zap, Map, Loader2
} from "lucide-react";

const levelBadgeColor: Record<string, string> = {
  A1: "bg-green-100 text-green-700 border-green-200",
  A2: "bg-blue-100 text-blue-700 border-blue-200",
  B1: "bg-purple-100 text-purple-700 border-purple-200",
  B2: "bg-orange-100 text-orange-700 border-orange-200",
  C1: "bg-red-100 text-red-700 border-red-200",
  C2: "bg-gray-100 text-gray-700 border-gray-200",
};

const levelGradient: Record<string, string> = {
  A1: "from-green-500 to-emerald-600",
  A2: "from-blue-500 to-cyan-600",
  B1: "from-purple-500 to-violet-600",
  B2: "from-orange-500 to-amber-600",
  C1: "from-red-500 to-pink-600",
  C2: "from-gray-600 to-gray-700",
};

type SelectedLesson = LearningTrack["lessons"][0] & { trackName: string };

export function LearningPath() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<LearningTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(null);

  useEffect(() => {
    learningService.getTracks({ lessons_limit: 20 } as any)
      .then((res) => setTracks(res.data))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStartLesson = (lesson: SelectedLesson) => {
    setSelectedLesson(null);
    // Navigate to flashcards with lesson ID
    navigate(`/flashcards/${lesson.id}`);
  };

  const totalLessons = tracks.reduce((s, t) => s + t.lessons.length, 0);
  const completedLessons = tracks.reduce(
    (s, t) => s + t.lessons.filter((l) => l.user_progress?.is_completed).length,
    0
  );
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center text-gray-400">
        <Loader2 className="size-6 animate-spin mr-2" /> Đang tải lộ trình...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Map className="size-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Lộ trình học tập</h1>
        </div>
        <p className="text-gray-600">Học theo tracks từ cơ bản đến nâng cao</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="size-5 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Tổng tracks</p>
              <p className="text-2xl font-bold">{tracks.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Star className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tổng bài học</p>
              <p className="text-2xl font-bold">{totalLessons}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Hoàn thành</p>
                <p className="text-2xl font-bold">{completedLessons}/{totalLessons}</p>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={overallProgress} className="h-1.5" />
              <p className="text-xs text-gray-400 mt-1">{overallProgress.toFixed(0)}% toàn bộ</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracks */}
      <div className="space-y-8">
        {tracks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Chưa có lộ trình học nào. Hãy thêm tracks trong Admin.
            </CardContent>
          </Card>
        ) : (
          tracks.map((track) => {
            const trackCompleted = track.lessons.filter((l) => l.user_progress?.is_completed).length;
            const trackProgress = track.lessons.length > 0
              ? (trackCompleted / track.lessons.length) * 100
              : 0;
            const gradient = levelGradient[track.target_level] || "from-gray-500 to-gray-600";

            return (
              <div key={track.id}>
                {/* Track Header */}
                <div className={`bg-gradient-to-r ${gradient} rounded-xl p-5 mb-4`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <BookOpen className="size-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${levelBadgeColor[track.target_level] || ""} border text-xs font-medium`}>
                            {track.target_level}
                          </Badge>
                          <Badge variant="secondary" className="text-xs capitalize">{track.track_group}</Badge>
                        </div>
                        <h2 className="text-xl font-bold text-white">{track.name}</h2>
                        {track.description && (
                          <p className="text-white/80 text-sm mt-0.5">{track.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-white">
                      <p className="text-sm text-white/80">Tiến độ</p>
                      <p className="text-xl font-bold">{trackCompleted}/{track.lessons.length}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={trackProgress} className="h-2 bg-white/30 [&>div]:bg-white" />
                  </div>
                </div>

                {/* Lessons */}
                <div className="relative pl-6">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-3">
                    {track.lessons.map((lesson) => {
                      const isCompleted = lesson.user_progress?.is_completed ?? false;
                      const learnedWords = lesson.user_progress?.learned_words ?? 0;

                      return (
                        <div key={lesson.id} className="relative">
                          <div className={`absolute -left-6 top-1/2 -translate-y-1/2 size-6 rounded-full border-2 flex items-center justify-center z-10
                            ${isCompleted ? "bg-green-500 border-green-500" : "bg-white border-blue-400"}`}>
                            {isCompleted ? (
                              <CheckCircle2 className="size-3.5 text-white" />
                            ) : (
                              <div className="size-2 rounded-full bg-blue-400" />
                            )}
                          </div>

                          <Card
                            className={`cursor-pointer transition-all hover:shadow-md ml-2 ${
                              isCompleted ? "border-green-200 bg-green-50/50" : "hover:border-blue-300"
                            }`}
                            onClick={() => setSelectedLesson({ ...lesson, trackName: track.name })}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-2.5 rounded-lg">
                                  <Brain className="size-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                                    {isCompleted && (
                                      <Badge className="bg-green-100 text-green-700 text-xs border-0">✓ Hoàn thành</Badge>
                                    )}
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-500 mt-0.5 truncate">{lesson.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <BookOpen className="size-3" /> {lesson.total_words} từ
                                    </span>
                                    {lesson.duration_minutes && (
                                      <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="size-3" /> {lesson.duration_minutes} phút
                                      </span>
                                    )}
                                    {learnedWords > 0 && (
                                      <span className="text-xs text-blue-600">
                                        {learnedWords}/{lesson.total_words} đã học
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="size-5 text-gray-400 shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lesson Dialog */}
      {selectedLesson && (
        <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedLesson.title}</DialogTitle>
              <DialogDescription>
                {selectedLesson.trackName} • {selectedLesson.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <BookOpen className="size-5 text-gray-500 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">{selectedLesson.total_words} từ vựng</p>
                </div>
                {selectedLesson.duration_minutes && (
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Clock className="size-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-sm text-blue-700">{selectedLesson.duration_minutes} phút</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => handleStartLesson(selectedLesson)}
                >
                  Bắt đầu học
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="outline" onClick={() => setSelectedLesson(null)}>
                  Để sau
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
