import { Link } from "react-router";
import { grammarLessons, grammarLevels } from "../data/grammar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { BookMarked, ChevronRight, Clock, BookOpen } from "lucide-react";

const levelColorMap: Record<string, { card: string; badge: string; border: string }> = {
  beginner: {
    card: "from-green-50 to-emerald-50",
    badge: "bg-green-100 text-green-700",
    border: "border-green-200",
  },
  elementary: {
    card: "from-blue-50 to-cyan-50",
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
  },
  intermediate: {
    card: "from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-700",
    border: "border-purple-200",
  },
  "upper-intermediate": {
    card: "from-orange-50 to-amber-50",
    badge: "bg-orange-100 text-orange-700",
    border: "border-orange-200",
  },
};

export function Grammar() {
  const lessonsByLevel = grammarLevels.map(level => ({
    ...level,
    lessons: grammarLessons.filter(l => l.level === level.id),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-2.5 rounded-xl">
            <BookMarked className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ngữ pháp tiếng Anh</h1>
            <p className="text-gray-600">
              {grammarLessons.length} bài học từ cơ bản đến nâng cao
            </p>
          </div>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {grammarLevels.map(level => {
          const count = grammarLessons.filter(l => l.level === level.id).length;
          const colors = levelColorMap[level.id];
          return (
            <Card key={level.id} className={`bg-gradient-to-br ${colors.card} ${colors.border}`}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">{level.icon}</div>
                <p className="text-sm font-medium text-gray-800">{level.nameVi}</p>
                <p className="text-xs text-gray-500 mt-0.5">{count} bài học</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lessons by level */}
      {lessonsByLevel.map(level => (
        <div key={level.id} className="space-y-4">
          {/* Level header */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{level.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{level.nameVi}</h2>
              <p className="text-sm text-gray-500">{level.name}</p>
            </div>
            <div className="flex-1 h-px bg-gray-200 ml-2" />
          </div>

          {level.lessons.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-400">
                <BookOpen className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Chưa có bài học ở cấp độ này</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {level.lessons.map(lesson => {
                const colors = levelColorMap[lesson.level];
                return (
                  <Link key={lesson.id} to={`/grammar/${lesson.id}`}>
                    <Card className={`hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer h-full border ${colors.border}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-3xl">{lesson.icon}</div>
                          <Badge className={`${colors.badge} border-0 text-xs shrink-0`}>
                            {level.nameVi}
                          </Badge>
                        </div>
                        <CardTitle className="text-base mt-2">{lesson.titleVi}</CardTitle>
                        <CardDescription className="text-sm leading-snug">
                          {lesson.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {lesson.exercises.length} bài tập
                            </span>
                            <span className="flex items-center gap-1">
                              <BookMarked className="size-3" />
                              {lesson.category}
                            </span>
                          </div>
                          <ChevronRight className="size-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white">Muốn luyện từ vựng đi kèm?</h3>
            <p className="text-purple-100 text-sm mt-0.5">
              Học từ vựng theo chủ đề để bổ trợ ngữ pháp hiệu quả hơn
            </p>
          </div>
          <Link to="/vocabulary">
            <Button variant="secondary" className="gap-2 shrink-0">
              Học từ vựng ngay
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
