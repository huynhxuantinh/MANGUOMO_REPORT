import apiClient from "./client";

export async function fetchWordsApi(params = {}) {
  const response = await apiClient.get("/words/", { params });
  return response.data;
}

export async function createWordApi(payload) {
  const response = await apiClient.post("/words/", payload);
  return response.data;
}

export async function updateWordApi(id, payload) {
  const response = await apiClient.patch(`/words/${id}/`, payload);
  return response.data;
}

export async function deleteWordApi(id) {
  await apiClient.delete(`/words/${id}/`);
}
