import apiClient from "./client";

export async function startStudySessionApi(payload) {
  const response = await apiClient.post("/study/start/", payload);
  return response.data;
}

export async function submitStudyAnswerApi(sessionId, payload) {
  const response = await apiClient.post(`/study/sessions/${sessionId}/answer/`, payload);
  return response.data;
}

export async function fetchStudyHistoryApi() {
  const response = await apiClient.get("/study/history/");
  return response.data;
}
