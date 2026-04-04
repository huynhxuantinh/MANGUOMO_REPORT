import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, Pencil, Trash2 } from "lucide-react";

import { addFavoriteWordApi, fetchFavoriteWordsApi, removeFavoriteWordApi } from "../api/favorites";
import { createWordApi, deleteWordApi, fetchWordsApi, updateWordApi } from "../api/words";
import AppNav from "../components/AppNav";
import { Button } from "../components/ui/button";

const defaultWord = {
  english_word: "",
  primary_meaning: "",
  part_of_speech: "noun",
  difficulty_level: "A1",
};

function WordsPage() {
  const [words, setWords] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(defaultWord);
  const [editingWordId, setEditingWordId] = useState(null);

  const title = useMemo(() => (editingWordId ? "Cap nhat tu vung" : "Them tu vung"), [editingWordId]);

  const loadFavorites = useCallback(async () => {
    const data = await fetchFavoriteWordsApi();
    const ids = new Set((Array.isArray(data) ? data : []).map((item) => item.word_id));
    setFavoriteIds(ids);
  }, []);

  const loadWords = useCallback(async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchWordsApi({ search: searchValue });
      setWords(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Khong tai duoc danh sach tu vung.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function boot() {
      await Promise.all([loadWords(""), loadFavorites()]);
    }
    boot();
  }, [loadWords, loadFavorites]);

  async function onSearch(event) {
    event.preventDefault();
    await loadWords(search);
  }

  function onInputChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function onEdit(word) {
    setEditingWordId(word.id);
    setFormData({
      english_word: word.english_word,
      primary_meaning: word.primary_meaning,
      part_of_speech: word.part_of_speech,
      difficulty_level: word.difficulty_level,
    });
  }

  function resetForm() {
    setEditingWordId(null);
    setFormData(defaultWord);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      if (editingWordId) {
        await updateWordApi(editingWordId, formData);
      } else {
        await createWordApi(formData);
      }
      resetForm();
      await loadWords(search);
    } catch (err) {
      const apiError = err.response?.data;
      if (typeof apiError?.detail === "string") {
        setError(apiError.detail);
      } else if (Array.isArray(apiError?.english_word) && apiError.english_word.length) {
        setError(apiError.english_word[0]);
      } else if (typeof apiError?.english_word === "string") {
        setError(apiError.english_word);
      } else {
        setError("Khong luu duoc tu vung.");
      }
    }
  }

  async function onDelete(id) {
    const yes = window.confirm("Ban chac chan muon xoa tu nay?");
    if (!yes) return;

    try {
      await deleteWordApi(id);
      const next = new Set(favoriteIds);
      next.delete(id);
      setFavoriteIds(next);
      await loadWords(search);
    } catch {
      setError("Khong xoa duoc tu vung.");
    }
  }

  async function onToggleFavorite(wordId) {
    try {
      if (favoriteIds.has(wordId)) {
        await removeFavoriteWordApi(wordId);
        const next = new Set(favoriteIds);
        next.delete(wordId);
        setFavoriteIds(next);
      } else {
        await addFavoriteWordApi(wordId);
        const next = new Set(favoriteIds);
        next.add(wordId);
        setFavoriteIds(next);
      }
    } catch {
      setError("Khong cap nhat duoc so tay tu vung.");
    }
  }

  return (
    <main className="app-page">
      <AppNav title="Quan ly tu vung" subtitle="Them, sua, xoa va luu tu vung vao so tay yeu thich." />

      <section className="grid gap-4 md:grid-cols-[1fr_1.3fr] md:gap-6">
        <div className="app-panel p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">English word</label>
              <input
                name="english_word"
                value={formData.english_word}
                onChange={onInputChange}
                required
                className="app-input"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nghia chinh</label>
              <input
                name="primary_meaning"
                value={formData.primary_meaning}
                onChange={onInputChange}
                required
                className="app-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Tu loai</label>
                <select
                  name="part_of_speech"
                  value={formData.part_of_speech}
                  onChange={onInputChange}
                  className="app-select"
                >
                  <option value="noun">noun</option>
                  <option value="verb">verb</option>
                  <option value="adjective">adjective</option>
                  <option value="adverb">adverb</option>
                  <option value="phrase">phrase</option>
                  <option value="other">other</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Muc do</label>
                <select
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={onInputChange}
                  className="app-select"
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button type="submit" className="w-full sm:w-auto">
                {editingWordId ? "Luu thay doi" : "Them moi"}
              </Button>
              {editingWordId ? (
                <Button type="button" variant="secondary" onClick={resetForm} className="w-full sm:w-auto">
                  Huy
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="app-panel p-4 sm:p-5">
          <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={onSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tim theo tu tieng Anh..."
              className="app-input"
            />
            <Button type="submit" className="w-full sm:w-auto">
              Tim
            </Button>
          </form>

          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
          {loading ? <p className="text-sm text-slate-500">Dang tai...</p> : null}

          <div className="space-y-3">
            {words.map((word) => {
              const favorited = favoriteIds.has(word.id);
              return (
                <article
                  key={word.id}
                  className="app-soft-panel flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-900">{word.english_word}</p>
                    <p className="break-words text-sm text-slate-600">
                      {word.primary_meaning} | {word.part_of_speech} | {word.difficulty_level}
                    </p>
                  </div>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button
                      size="sm"
                      variant={favorited ? "default" : "secondary"}
                      onClick={() => onToggleFavorite(word.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onEdit(word)} className="flex-1 sm:flex-none">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(word.id)} className="flex-1 sm:flex-none">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </article>
              );
            })}

            {!loading && words.length === 0 ? (
              <p className="text-sm text-slate-500">Chua co du lieu tu vung.</p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export default WordsPage;
