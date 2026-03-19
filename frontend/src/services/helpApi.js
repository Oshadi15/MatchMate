import API from "./api";

export const getHelpRequests = (params) => API.get("/api/help", { params });
export const createHelpRequest = (data) => API.post("/api/help", data);
export const deleteHelpRequest = (id) => API.delete(`/api/help/${id}`);
export const updateHelpStatus = (id, status) =>
  API.patch(`/api/help/${id}/status`, { status });