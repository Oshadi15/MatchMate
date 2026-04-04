import API from "./api";

export const getHelpRequests = (params) => API.get("/api/help", { params });

export const createHelpRequest = (data) => API.post("/api/help", data);

export const deleteHelpRequest = (id) => API.delete(`/api/help/${id}`);

export const getMyHelpRequests = (requesterKey) =>
  API.get("/api/help/my-requests", {
    params: { requesterKey },
  });

export const getHelpRequestById = (id) => API.get(`/api/help/${id}`);

export const replyToHelpRequest = (id, adminReply, status) =>
  API.patch(`/api/help/${id}/reply`, { adminReply, status });

export const updateHelpStatus = (id, status) =>
  API.patch(`/api/help/${id}/status`, { status });