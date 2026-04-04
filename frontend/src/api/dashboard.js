import apiClient from "./client";

export async function fetchDashboardApi() {
  const response = await apiClient.get("/dashboard/");
  return response.data;
}
