import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { BookOpen, Brain, Trophy, TrendingUp, ArrowRight, Map, BookMarked, Flame, Zap, Loader2 } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../contexts/AuthContext";
import { dashboardService, DashboardData } from "../lib/services";
import { grammarLessons } from "../data/grammar";

export function Home() {
  const { user, isAuthenticated } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingDash(true);
    dashboardService.get()
      .then((res) => setDashboard(res.data))
      .catch(() => setDashboard(null))
      .finally(() => setLoadingDash(false));
  }, [isAuthenticated]);

  const wordsTotal = dashboard?.summary.words_total ?? 0;
  const progressTotal = dashboard?.summary.progress_total ?? 0;
  const streak = dashboard?.profile.streak_count ?? 0;
  const xpTotal = dashboard?.profile.xp_total ?? 0;
  const wordsStudiedToday = dashboard?.today.words_studied ?? 0;
  const overallPct = wordsTotal > 0 ? (progressTotal / wordsTotal) * 100 : 0;

  const features = [
    {
      icon: BookOpen,
      title: "Học từ vựng",
      desc: "Kho từ vựng phong phú theo chủ đề",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconColor: "#2563eb",
      path: "/vocabulary",
    },
    {
      icon: BookMarked,
      title: "Ngữ pháp",
      desc: "7 bài ngữ pháp từ cơ bản đến nâng cao",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      iconColor: "#7c3aed",
      path: "/grammar",
    },
    {
      icon: Map,
      title: "Lộ trình học",
      desc: "Học theo track A1→B2 có hệ thống",
      color: "from-green-500 to-green-600",
      bg: "bg-green-50",
      iconColor: "#16a34a",
      path: "/learning-path",
    },
    {
      icon: TrendingUp,
      title: "Theo dõi tiến độ",
      desc: "Thống kê chi tiết quá trình học",
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      iconColor: "#d97706",
      path: "/progress",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-10">
        {isAuthenticated ? (
          <>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm mb-2">
              <Flame className="size-4 text-orange-500" />
              Chuỗi học: <strong>{streak} ngày</strong>
              <span className="mx-1">•</span>
              <Zap className="size-4 text-amber-500" />
              <strong>{xpTotal.toLocaleString()} XP</strong>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chào mừng trở lại, {user?.username?.split(" ")[0]}! 👋
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tiếp tục hành trình học tiếng Anh của bạn. Hôm nay bạn muốn học gì?
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              English Learning Hub
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nền tảng học tiếng Anh toàn diện với flashcards, quiz tương tác, ngữ pháp và lộ trình học cá nhân hóa
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Bắt đầu miễn phí
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link to="/vocabulary">
                <Button variant="outline" size="lg">Khám phá từ vựng</Button>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Stats Cards */}
      {isAuthenticated && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-gray-600">Tổng từ vựng</CardTitle>
              <BookOpen className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">{wordsTotal}</div>
              <p className="text-xs text-gray-500 mt-0.5">Từ vựng có sẵn</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-gray-600">Đã học</CardTitle>
              <Brain className="size-4 text-purple-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">{progressTotal}</div>
              <p className="text-xs text-gray-500 mt-0.5">Từ đã học</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-gray-600">Hôm nay</CardTitle>
              <Trophy className="size-4 text-amber-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">{wordsStudiedToday}</div>
              <p className="text-xs text-gray-500 mt-0.5">Từ đã ôn hôm nay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-gray-600">Chuỗi học</CardTitle>
              <Flame className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">{streak}</div>
              <p className="text-xs text-gray-500 mt-0.5">Ngày liên tiếp</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall Progress (chỉ hiển thị khi đã đăng nhập) */}
      {isAuthenticated && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-blue-600" />
                Tiến độ học từ vựng
              </CardTitle>
              <Link to="/progress">
                <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                  Xem chi tiết <ArrowRight className="size-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingDash ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="size-4 animate-spin" /> Đang tải...
              </div>
            ) : (
              <>
                <Progress value={overallPct} className="h-3" />
                <p className="text-sm text-gray-600">
                  {progressTotal} / {wordsTotal} từ — {overallPct.toFixed(1)}% hoàn thành
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Features Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Tính năng học tập</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.path} to={f.path}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${f.bg}`}>
                      <Icon className="size-6" style={{ color: f.iconColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{f.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
                    </div>
                    <ArrowRight className="size-4 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Next Recommendation (nếu có) */}
      {isAuthenticated && dashboard?.next_recommendation?.lesson && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-4 text-blue-600" />
              Gợi ý tiếp theo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">{dashboard.next_recommendation.lesson.title}</p>
              <p className="text-sm text-gray-500">
                {dashboard.next_recommendation.lesson.track.name} •{" "}
                {dashboard.next_recommendation.lesson.track.target_level}
              </p>
            </div>
            <Link to="/learning-path">
              <Button size="sm" className="gap-1 shrink-0">
                Học ngay <ArrowRight className="size-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Grammar quick access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Ngữ pháp nổi bật</h2>
          <Link to="/grammar">
            <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
              Xem tất cả <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {grammarLessons.slice(0, 4).map(lesson => (
            <Link key={lesson.id} to={`/grammar/${lesson.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{lesson.icon}</div>
                  <p className="text-sm font-medium text-gray-900 leading-snug">{lesson.titleVi}</p>
                  <p className="text-xs text-gray-500 mt-1">{lesson.level}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!isAuthenticated && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">Tạo tài khoản để lưu tiến độ!</CardTitle>
            <CardDescription className="text-blue-100">
              Đăng ký miễn phí để đồng bộ tiến độ học tập, theo dõi thành tích và nhận lộ trình học cá nhân hóa
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Link to="/register">
              <Button variant="secondary" className="gap-2">
                Đăng ký ngay
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="gap-2 border-white/40 text-white hover:bg-white/10">
                Đăng nhập
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
