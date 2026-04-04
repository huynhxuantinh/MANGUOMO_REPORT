import apiClient from "./client";

export async function fetchLearningTracksApi() {
  const response = await apiClient.get("/learning/tracks/");
  return response.data;
}

export async function fetchLearningTrackDetailApi(slug) {
  const response = await apiClient.get(`/learning/tracks/${slug}/`);
  return response.data;
}

export async function fetchLearningLessonsApi(params = {}) {
  const response = await apiClient.get("/learning/lessons/", { params });
  return response.data;
}

export async function fetchLearningLessonDetailApi(lessonId) {
  const response = await apiClient.get(`/learning/lessons/${lessonId}/`);
  return response.data;
}

export async function fetchPlacementQuestionsApi() {
  const response = await apiClient.get("/onboarding/placement/");
  return response.data;
}

export async function submitPlacementAnswersApi(payload) {
  const response = await apiClient.post("/onboarding/placement/", payload);
  return response.data;
}

export async function setupLearningPathApi(payload) {
  const response = await apiClient.post("/learning-path/setup/", payload);
  return response.data;
}

export async function fetchLearningPathApi() {
  const response = await apiClient.get("/learning-path/me/");
  return response.data;
}

export async function fetchRecommendationApi() {
  const response = await apiClient.get("/recommendations/next/");
  return response.data;
}

export async function fetchLessonQuizApi(quizId) {
  const response = await apiClient.get(`/quizzes/${quizId}/`);
  return response.data;
}

export async function submitLessonQuizApi(quizId, payload) {
  const response = await apiClient.post(`/quizzes/${quizId}/submit/`, payload);
  return response.data;
}
