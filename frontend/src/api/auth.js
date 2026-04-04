import apiClient from "./client";

export async function loginApi(payload) {
  const response = await apiClient.post("/auth/token/", payload);
  return response.data;
}

export async function registerApi(payload) {
  const response = await apiClient.post("/auth/register/", payload);
  return response.data;
}

export async function getMeApi() {
  const response = await apiClient.get("/auth/me/");
  return response.data;
}
