import apiClient from "./client";

export async function fetchMyProfileApi() {
  const response = await apiClient.get("/profile/me/");
  return response.data;
}

export async function updateMyProfileApi(payload) {
  const response = await apiClient.patch("/profile/me/", payload);
  return response.data;
}
