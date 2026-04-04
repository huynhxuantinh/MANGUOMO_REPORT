import apiClient from "./client";

export async function fetchFavoriteWordsApi(params = {}) {
  const response = await apiClient.get("/favorites/words/", { params });
  return response.data;
}

export async function addFavoriteWordApi(wordId) {
  const response = await apiClient.post("/favorites/words/", { word_id: wordId });
  return response.data;
}

export async function removeFavoriteWordApi(wordId) {
  await apiClient.delete(`/favorites/words/${wordId}/`);
}

export async function fetchFavoriteLessonsApi(params = {}) {
  const response = await apiClient.get("/favorites/lessons/", { params });
  return response.data;
}

export async function addFavoriteLessonApi(lessonId) {
  const response = await apiClient.post("/favorites/lessons/", { lesson_id: lessonId });
  return response.data;
}

export async function removeFavoriteLessonApi(lessonId) {
  await apiClient.delete(`/favorites/lessons/${lessonId}/`);
}
