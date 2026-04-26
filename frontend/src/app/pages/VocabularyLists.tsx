import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Search, Volume2, Star, StarOff, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { vocabularyService, favoriteService, Topic, VocabularyWordAPI } from "../lib/services";
import { useAuth } from "../contexts/AuthContext";

const PAGE_SIZE = 20;

export function VocabularyLists() {
  const { isAuthenticated } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [words, setWords] = useState<VocabularyWordAPI[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Load topics
  useEffect(() => {
    vocabularyService.getTopics().then((res) => setTopics(res.data)).catch(() => {});
  }, []);

  // Load favorites
  useEffect(() => {
    if (!isAuthenticated) return;
    favoriteService.getWords().then((res) => {
      const ids = new Set<number>(res.data.map((f: any) => f.word.id));
      setFavoriteIds(ids);
    }).catch(() => {});
  }, [isAuthenticated]);

  // Load words
  const loadWords = useCallback((p: number, search: string, topicId: string) => {
    setLoading(true);
    vocabularyService.getWords({
      search: search || undefined,
      topic_id: topicId !== "all" ? Number(topicId) : undefined,
      page: p,
      page_size: PAGE_SIZE,
    })
      .then((res) => {
        setWords(res.data.results);
        setTotalWords(res.data.count);
      })
      .catch(() => setWords([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadWords(page, searchQuery, selectedTopic);
  }, [page, selectedTopic, loadWords]);

  // Debounce search
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeout) clearTimeout(searchTimeout);
    const t = setTimeout(() => {
      setPage(1);
      loadWords(1, val, selectedTopic);
    }, 400);
    setSearchTimeout(t);
  };

  const handleTabChange = (topic: string) => {
    setSelectedTopic(topic);
    setPage(1);
  };

  const totalPages = Math.ceil(totalWords / PAGE_SIZE);

  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(word);
      u.lang = "en-US";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const toggleFavorite = async (wordId: number) => {
    if (!isAuthenticated) return;
    const isFav = favoriteIds.has(wordId);
    try {
      if (isFav) {
        await favoriteService.removeWord(wordId);
        setFavoriteIds((prev) => { const s = new Set(prev); s.delete(wordId); return s; });
      } else {
        await favoriteService.addWord(wordId);
        setFavoriteIds((prev) => new Set(prev).add(wordId));
      }
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Danh sách từ vựng</h1>
        <p className="text-gray-600">Khám phá và học từ vựng tiếng Anh ({totalWords} từ)</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Tìm kiếm từ vựng..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Topic Tabs */}
      <Tabs value={selectedTopic} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          {topics.map((topic) => (
            <TabsTrigger key={topic.id} value={String(topic.id)}>
              {topic.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTopic} className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="size-6 animate-spin mr-2" /> Đang tải...
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600">Hiển thị {words.length} / {totalWords} từ vựng</div>

              <div className="grid grid-cols-1 gap-4">
                {words.map((word) => (
                  <Card key={word.id} className={favoriteIds.has(word.id) ? "border-amber-200 bg-amber-50/30" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-2xl">{word.english_word}</CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => speakWord(word.english_word)}
                              className="size-8"
                            >
                              <Volume2 className="size-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{word.part_of_speech}</Badge>
                            {word.phonetic && (
                              <span className="text-sm text-gray-600">{word.phonetic}</span>
                            )}
                            <Badge variant="outline">{word.difficulty_level}</Badge>
                            {word.topics.map((t) => (
                              <Badge key={t.id} variant="outline" className="text-xs">
                                {t.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {isAuthenticated && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(word.id)}
                            className="shrink-0"
                          >
                            {favoriteIds.has(word.id) ? (
                              <Star className="size-5 fill-amber-400 text-amber-400" />
                            ) : (
                              <StarOff className="size-5 text-gray-400" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">{word.primary_meaning}</p>
                      </div>
                      {word.meanings?.slice(0, 2).map((m) => (
                        <div key={m.id} className="text-sm text-gray-600">
                          <span className="font-medium">{m.part_of_speech}: </span>
                          {m.meaning_vi}
                        </div>
                      ))}
                      {word.examples?.slice(0, 1).map((ex, i) => (
                        <div key={i} className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700 italic">"{ex.sentence_en}"</p>
                          <p className="text-sm text-gray-500 mt-1">{ex.sentence_vi}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}

                {words.length === 0 && !loading && (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      Không tìm thấy từ vựng nào
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" /> Trước
                  </Button>
                  <span className="text-sm text-gray-600">
                    Trang {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="gap-1"
                  >
                    Sau <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
