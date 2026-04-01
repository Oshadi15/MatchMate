import API from "./api";

// ✅ base route is /api/help (because server.js uses app.use("/api/help", ...))

export const getHelpRequests = (params) => API.get("/api/help", { params });

export const createHelpRequest = (data) => API.post("/api/help", data);

export const deleteHelpRequest = (id) => API.delete(`/api/help/${id}`);

export const getMyHelpRequests = (requesterKey) =>
  API.get("/api/help/mine", {
    params: { requesterKey },
  });

// single request by id (for Reply page)
export const getHelpRequestById = (id) => API.get(`/api/help/${id}`);

// admin reply (needs backend route PATCH /api/help/:id/reply)
export const replyToHelpRequest = (id, adminReply) =>
  API.patch(`/api/help/${id}/reply`, { adminReply });

// status update (needs backend route PATCH /api/help/:id/status)
export const updateHelpStatus = (id, status) =>
  API.patch(`/api/help/${id}/status`, { status });