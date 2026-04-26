import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { progressService, dashboardService, DashboardData } from "../lib/services";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, BookOpen, Brain, Trophy, Flame, Target,
  Calendar, CheckCircle2, Zap, Star, ArrowRight, Loader2
} from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export function ProgressPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.get()
      .then((res) => setDashboard(res.data))
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  const summary = dashboard?.summary;
  const profile = dashboard?.profile;
  const weekly = dashboard?.weekly_activity ?? [];
  const statusCounts = dashboard?.progress_by_status ?? {};
  const wordsByLevel = dashboard?.words_by_level ?? {};

  const wordsTotal = summary?.words_total ?? 0;
  const progressTotal = summary?.progress_total ?? 0;
  const accuracy = summary?.accuracy ?? 0;
  const streak = profile?.streak_count ?? 0;
  const xpTotal = profile?.xp_total ?? 0;
  const xpLevel = Math.floor(xpTotal / 500) + 1;
  const xpInLevel = xpTotal % 500;

  const weeklyChart = useMemo(() => {
    return weekly.map((d) => ({
      day: new Date(d.date).toLocaleDateString("vi-VN", { weekday: "short" }),
      wordsStudied: d.words_studied,
      xpEarned: d.xp_earned,
    }));
  }, [weekly]);

  const levelPieData = useMemo(() => {
    return Object.entries(wordsByLevel).map(([level, count]) => ({
      name: level,
      value: count as number,
    }));
  }, [wordsByLevel]);

  const recentSessions = dashboard?.recent_sessions ?? [];
  const weakTags = dashboard?.weak_tags ?? [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center text-gray-400">
        <Loader2 className="size-6 animate-spin mr-2" /> Đang tải tiến độ...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Tiến độ học tập</h1>
        </div>
        <p className="text-gray-600">Thống kê chi tiết quá trình học của bạn</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-blue-200" />
              <span className="text-sm text-blue-100">Đã học</span>
            </div>
            <p className="text-3xl font-bold">{progressTotal}</p>
            <p className="text-xs text-blue-200">/ {wordsTotal} từ</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-amber-200" />
              <span className="text-sm text-amber-100">Độ chính xác</span>
            </div>
            <p className="text-3xl font-bold">{accuracy.toFixed(0)}%</p>
            <p className="text-xs text-amber-200">tổng các lần ôn</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-green-200" />
              <span className="text-sm text-green-100">Chuỗi ngày</span>
            </div>
            <p className="text-3xl font-bold">{streak}</p>
            <p className="text-xs text-green-200">ngày liên tiếp</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-purple-200" />
              <span className="text-sm text-purple-100">Level {xpLevel}</span>
            </div>
            <p className="text-3xl font-bold">{xpTotal.toLocaleString()}</p>
            <p className="text-xs text-purple-200">XP tích lũy</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-blue-600" />
              Tiến độ từ vựng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tổng quan</span>
                <span className="font-medium">{progressTotal}/{wordsTotal} ({wordsTotal > 0 ? ((progressTotal / wordsTotal) * 100).toFixed(0) : 0}%)</span>
              </div>
              <Progress value={wordsTotal > 0 ? (progressTotal / wordsTotal) * 100 : 0} className="h-2" />
            </div>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">{status}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
                <Progress value={wordsTotal > 0 ? ((count as number) / wordsTotal) * 100 : 0} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-purple-600" />
              XP & Cấp độ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{recentSessions.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Phiên học gần đây</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{accuracy.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Độ chính xác TB</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Level {xpLevel} → {xpLevel + 1}</span>
                <span className="font-medium">{xpInLevel}/500 XP</span>
              </div>
              <Progress value={(xpInLevel / 500) * 100} className="h-2" />
            </div>
            <Link to="/learning-path">
              <Button variant="outline" className="w-full gap-2 mt-2">
                Xem lộ trình học
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4 text-blue-600" />
              Hoạt động 7 ngày gần nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="wordsStudied" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Từ học" />
                <Bar dataKey="xpEarned" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="XP" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500" />
                <span className="text-xs text-gray-600">Từ học được</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-purple-500" />
                <span className="text-xs text-gray-600">XP kiếm được</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Pie Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="size-4 text-purple-600" />
              Phân bố từ theo cấp độ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {levelPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={levelPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {levelPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} từ`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {levelPieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Brain className="size-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Chưa có dữ liệu</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weak Tags */}
      {weakTags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4 text-red-500" />
              Điểm cần cải thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weakTags.map((tag) => (
                <div key={tag.tag} className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{tag.tag}</p>
                    <p className="text-xs text-gray-500">{tag.total} lần thử</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-0">
                    {tag.accuracy.toFixed(0)}% đúng
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-amber-600" />
              Phiên học gần đây
            </div>
            <Link to="/vocabulary">
              <Button variant="ghost" size="sm" className="gap-1 text-blue-600">
                Học tiếp <ArrowRight className="size-3" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((s) => {
                const pct = s.total_questions > 0 ? Math.round((s.correct_answers / s.total_questions) * 100) : 0;
                return (
                  <div key={s.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                      pct >= 80 ? "bg-green-100" : pct >= 60 ? "bg-yellow-100" : "bg-red-100"
                    }`}>
                      <span className={`text-sm font-bold ${
                        pct >= 80 ? "text-green-700" : pct >= 60 ? "text-yellow-700" : "text-red-700"
                      }`}>{pct}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 capitalize">{s.mode}</p>
                      <p className="text-xs text-gray-500">
                        {s.correct_answers}/{s.total_questions} đúng •{" "}
                        {new Date(s.started_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <Badge className={
                      pct >= 80 ? "bg-green-100 text-green-700 border-0" :
                      pct >= 60 ? "bg-yellow-100 text-yellow-700 border-0" :
                      "bg-red-100 text-red-700 border-0"
                    }>
                      {s.ended_at ? "Hoàn thành" : "Đang học"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="size-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chưa có phiên học nào</p>
              <Link to="/vocabulary">
                <Button variant="outline" size="sm" className="mt-3">Bắt đầu học</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="size-4 text-green-600" />
            Thành tích
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "🌱", title: "Người mới", desc: "Học từ đầu tiên", unlocked: progressTotal >= 1 },
              { icon: "📚", title: "Siêng năng", desc: "Học 10 từ", unlocked: progressTotal >= 10 },
              { icon: "🎯", title: "Tập trung", desc: "Học 25 từ", unlocked: progressTotal >= 25 },
              { icon: "🏆", title: "Từ điển sống", desc: "Học 100 từ", unlocked: progressTotal >= 100 },
              { icon: "⚡", title: "Tốc độ", desc: "5 phiên học", unlocked: recentSessions.length >= 5 },
              { icon: "🎖️", title: "Chuyên gia", desc: "Độ chính xác ≥ 90%", unlocked: accuracy >= 90 },
              { icon: "🔥", title: "Kiên trì", desc: "Học 3 ngày liên tục", unlocked: streak >= 3 },
              { icon: "⭐", title: "Xuất sắc", desc: "1000 XP", unlocked: xpTotal >= 1000 },
            ].map((ach) => (
              <div
                key={ach.title}
                className={`p-3 rounded-xl text-center border transition-all ${
                  ach.unlocked
                    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                    : "bg-gray-50 border-gray-200 opacity-50 grayscale"
                }`}
              >
                <div className="text-3xl mb-1">{ach.icon}</div>
                <p className="text-sm font-medium text-gray-900">{ach.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{ach.desc}</p>
                {ach.unlocked && (
                  <Badge className="mt-1.5 bg-amber-100 text-amber-700 border-0 text-xs">Đạt được!</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}