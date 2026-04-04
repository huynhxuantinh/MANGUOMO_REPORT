import apiClient from "./client";

export async function fetchProgressOverviewApi() {
  const response = await apiClient.get("/progress/overview/");
  return response.data;
}
