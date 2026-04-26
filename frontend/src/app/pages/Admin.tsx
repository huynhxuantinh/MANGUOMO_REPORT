import { useState, useMemo } from "react";
import { Link, Navigate } from "react-router";
import { useAuth, User } from "../contexts/AuthContext";
import { vocabularyData, categories } from "../data/vocabulary";
import { grammarLessons } from "../data/grammar";
import { learningPath } from "../data/learningPath";
import { loadProgress } from "../utils/storage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Shield, Users, BookOpen, Trophy, TrendingUp, BookMarked,
  Map, Search, Trash2, Eye, BarChart2, Calendar, Star
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

type AdminTab = "dashboard" | "users" | "vocabulary" | "quiz";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const USERS_KEY = "elh_users";

function getStoredUsers(): Array<User & { password?: string; createdAt: string }> {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function Admin() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchWord, setSearchWord] = useState("");
  const [searchUser, setSearchUser] = useState("");

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const progress = useMemo(() => loadProgress(), []);
  const allUsers = useMemo(() => getStoredUsers(), []);
  const quizResults = progress.quizResults || [];

  // Stats
  const totalUsers = allUsers.length;
  const totalWords = vocabularyData.length;
  const learnedCount = progress.learnedWords.size;
  const masteredCount = progress.masteredWords.size;
  const totalQuizzes = quizResults.length;
  const avgScore = totalQuizzes > 0
    ? quizResults.reduce((s, r) => s + r.percentage, 0) / totalQuizzes
    : 0;

  // Category stats for chart
  const categoryStats = categories.map((cat, i) => {
    const words = vocabularyData.filter(w => w.category === cat.id);
    const learned = words.filter(w => progress.learnedWords.has(w.id)).length;
    return {
      name: cat.name,
      total: words.length,
      learned,
      fill: COLORS[i % COLORS.length],
    };
  });

  // Quiz by category
  const quizByCat = categories.map(cat => ({
    name: cat.name,
    count: quizResults.filter(r => r.categoryId === cat.id).length,
    avgScore: quizResults.filter(r => r.categoryId === cat.id).length > 0
      ? quizResults.filter(r => r.categoryId === cat.id).reduce((s, r) => s + r.percentage, 0) /
        quizResults.filter(r => r.categoryId === cat.id).length
      : 0,
  })).filter(x => x.count > 0);

  // Filtered vocabulary
  const filteredWords = vocabularyData.filter(w =>
    w.word.toLowerCase().includes(searchWord.toLowerCase()) ||
    w.translation.toLowerCase().includes(searchWord.toLowerCase()) ||
    w.category.toLowerCase().includes(searchWord.toLowerCase())
  );

  // Filtered users
  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const tabs = [
    { id: "dashboard" as AdminTab, label: "Tổng quan", icon: BarChart2 },
    { id: "users" as AdminTab, label: "Người dùng", icon: Users },
    { id: "vocabulary" as AdminTab, label: "Nội dung", icon: BookOpen },
    { id: "quiz" as AdminTab, label: "Quiz & Kết quả", icon: Trophy },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-purple-600 to-violet-700 p-2.5 rounded-xl">
          <Shield className="size-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Trang Quản trị</h1>
          <p className="text-gray-500 text-sm">Xin chào, {user?.name} · Quản lý hệ thống English Learning Hub</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Người dùng", value: totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Từ vựng", value: totalWords, icon: BookOpen, color: "text-green-600", bg: "bg-green-50" },
              { label: "Đã học", value: learnedCount, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Thành thạo", value: masteredCount, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Bài quiz", value: totalQuizzes, icon: Trophy, color: "text-red-600", bg: "bg-red-50" },
              { label: "Điểm TB", value: `${avgScore.toFixed(0)}%`, icon: BarChart2, color: "text-cyan-600", bg: "bg-cyan-50" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <Card key={item.label}>
                  <CardContent className="p-4">
                    <div className={`inline-flex p-2 rounded-lg ${item.bg} mb-2`}>
                      <Icon className={`size-4 ${item.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="size-4 text-blue-600" />
                  Từ vựng đã học theo chủ đề
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryStats} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" name="Tổng số" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="learned" name="Đã học" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="size-4 text-amber-600" />
                  Phân bố nội dung học
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryStats} cx="50%" cy="50%" outerRadius={70} dataKey="total">
                      {categoryStats.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} từ`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {categoryStats.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookMarked className="size-4 text-purple-600" />
                  Ngữ pháp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{grammarLessons.length}</p>
                <p className="text-sm text-gray-500">Bài học ngữ pháp</p>
                <div className="space-y-1">
                  {["beginner", "elementary", "intermediate", "upper-intermediate"].map(level => (
                    <div key={level} className="flex justify-between text-xs text-gray-500">
                      <span className="capitalize">{level}</span>
                      <span>{grammarLessons.filter(l => l.level === level).length} bài</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Map className="size-4 text-green-600" />
                  Lộ trình học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{learningPath.reduce((s, u) => s + u.lessons.length, 0)}</p>
                <p className="text-sm text-gray-500">Tổng bài học trong lộ trình</p>
                <div className="space-y-1">
                  {learningPath.map(unit => (
                    <div key={unit.id} className="flex justify-between text-xs text-gray-500">
                      <span>{unit.level} - {unit.titleVi}</span>
                      <span>{unit.lessons.length} bài</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="size-4 text-blue-600" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{(progress.dailyActivity || []).length}</p>
                <p className="text-sm text-gray-500">Ngày có hoạt động</p>
                {(progress.dailyActivity || []).slice(0, 3).map(d => (
                  <div key={d.date} className="flex justify-between text-xs text-gray-500">
                    <span>{new Date(d.date).toLocaleDateString("vi-VN")}</span>
                    <span>{d.wordsLearned} từ, {d.quizzesTaken} quiz</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold">Quản lý người dùng</h2>
              <p className="text-sm text-gray-500">{allUsers.length} tài khoản đã đăng ký</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Tìm người dùng..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Người dùng</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Vai trò</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ngày tạo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        Không tìm thấy người dùng
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge className={u.role === "admin"
                            ? "bg-purple-100 text-purple-700 border-0"
                            : "bg-gray-100 text-gray-700 border-0"
                          }>
                            {u.role === "admin" ? (
                              <><Shield className="size-3 mr-1" />Admin</>
                            ) : (
                              <><Users className="size-3 mr-1" />Học viên</>
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="size-7" title="Xem">
                              <Eye className="size-3.5 text-blue-600" />
                            </Button>
                            {u.role !== "admin" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                title="Xóa (demo)"
                                onClick={() => alert("Chức năng xóa user cần kết nối database")}
                              >
                                <Trash2 className="size-3.5 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Vocabulary/Content Tab */}
      {activeTab === "vocabulary" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold">Quản lý nội dung</h2>
              <p className="text-sm text-gray-500">{vocabularyData.length} từ vựng · {grammarLessons.length} bài ngữ pháp</p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Tìm từ vựng..."
                  value={searchWord}
                  onChange={e => setSearchWord(e.target.value)}
                  className="pl-9 w-56"
                />
              </div>
              <Button
                className="gap-2"
                onClick={() => alert("Chức năng thêm từ vựng cần kết nối database backend")}
              >
                + Thêm từ
              </Button>
            </div>
          </div>

          {/* Category summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat, i) => {
              const count = vocabularyData.filter(w => w.category === cat.id).length;
              return (
                <Card key={cat.id} className="text-center">
                  <CardContent className="p-3">
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                    <p className="text-xs text-gray-500">{count} từ</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Vocabulary table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Danh sách từ vựng ({filteredWords.length})
              </CardTitle>
              <CardDescription>
                Dữ liệu tĩnh – cần kết nối Supabase để chỉnh sửa trong thời gian thực
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Từ vựng</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Loại từ</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nghĩa</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Chủ đề</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWords.slice(0, 20).map(word => {
                    const cat = categories.find(c => c.id === word.category);
                    const isLearned = progress.learnedWords.has(word.id);
                    const isMastered = progress.masteredWords.has(word.id);
                    return (
                      <tr key={word.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-gray-900">{word.word}</span>
                            <span className="text-xs text-gray-400 ml-2">{word.pronunciation}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-xs">{word.partOfSpeech}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{word.translation}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{cat?.icon} {cat?.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          {isMastered ? (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">⭐ Thành thạo</Badge>
                          ) : isLearned ? (
                            <Badge className="bg-green-100 text-green-700 border-0 text-xs">✓ Đã học</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-400">Chưa học</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="size-7" onClick={() => alert("Sửa từ cần backend")}>
                              <Eye className="size-3.5 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7" onClick={() => alert("Xóa từ cần backend")}>
                              <Trash2 className="size-3.5 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredWords.length > 20 && (
                <div className="px-4 py-3 text-center text-sm text-gray-500 border-t">
                  Hiển thị 20 / {filteredWords.length} từ vựng
                </div>
              )}
            </div>
          </Card>

          {/* Grammar list */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Bài học ngữ pháp ({grammarLessons.length})</CardTitle>
                <Link to="/grammar">
                  <Button variant="ghost" size="sm">Xem tất cả</Button>
                </Link>
              </div>
            </CardHeader>
            <div className="divide-y divide-gray-100">
              {grammarLessons.map(lesson => (
                <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <span className="text-xl">{lesson.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{lesson.titleVi}</p>
                    <p className="text-xs text-gray-500">{lesson.exercises.length} bài tập · {lesson.category}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">{lesson.level}</Badge>
                  <Link to={`/grammar/${lesson.id}`}>
                    <Button variant="ghost" size="icon" className="size-7">
                      <Eye className="size-3.5 text-blue-600" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Quiz & Results Tab */}
      {activeTab === "quiz" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Quiz & Kết quả học tập</h2>
            <p className="text-sm text-gray-500">Tổng quan kết quả quiz và lộ trình</p>
          </div>

          {/* Quiz stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-5">
                <Trophy className="size-6 text-blue-200 mb-2" />
                <p className="text-3xl font-bold">{totalQuizzes}</p>
                <p className="text-blue-100 text-sm">Bài quiz đã làm</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-5">
                <BarChart2 className="size-6 text-green-200 mb-2" />
                <p className="text-3xl font-bold">{avgScore.toFixed(0)}%</p>
                <p className="text-green-100 text-sm">Điểm trung bình</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
              <CardContent className="p-5">
                <Star className="size-6 text-amber-200 mb-2" />
                <p className="text-3xl font-bold">
                  {totalQuizzes > 0 ? Math.max(...quizResults.map(r => r.percentage)).toFixed(0) : 0}%
                </p>
                <p className="text-amber-100 text-sm">Điểm cao nhất</p>
              </CardContent>
            </Card>
          </div>

          {/* Quiz by category chart */}
          {quizByCat.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Điểm quiz theo chủ đề</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={quizByCat} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(0)}%`, "Điểm TB"]} />
                    <Bar dataKey="avgScore" name="Điểm TB" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Quiz result list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lịch sử quiz ({quizResults.length})</CardTitle>
            </CardHeader>
            {quizResults.length === 0 ? (
              <CardContent className="py-10 text-center text-gray-400">
                <Trophy className="size-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chưa có kết quả quiz nào</p>
              </CardContent>
            ) : (
              <div className="divide-y divide-gray-100">
                {quizResults.slice(0, 20).map(result => (
                  <div key={result.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      result.percentage >= 80 ? "bg-green-100 text-green-700"
                        : result.percentage >= 60 ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {result.percentage.toFixed(0)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{result.categoryName}</p>
                      <p className="text-xs text-gray-500">
                        {result.score}/{result.total} câu đúng · {new Date(result.date).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <Badge className={
                      result.percentage >= 80
                        ? "bg-green-100 text-green-700 border-0"
                        : result.percentage >= 60
                        ? "bg-yellow-100 text-yellow-700 border-0"
                        : "bg-red-100 text-red-700 border-0"
                    }>
                      {result.percentage >= 80 ? "🏆 Xuất sắc"
                        : result.percentage >= 60 ? "👍 Tốt"
                        : "💪 Cố gắng"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Learning path overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Map className="size-4 text-green-600" />
                Lộ trình học ({learningPath.length} units)
              </CardTitle>
            </CardHeader>
            <div className="divide-y divide-gray-100">
              {learningPath.map(unit => (
                <div key={unit.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{unit.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{unit.titleVi}</p>
                        <p className="text-xs text-gray-500">{unit.lessons.length} bài học · {unit.level}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{unit.levelName}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
