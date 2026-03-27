import axios from "axios";

const API_URL = "http://localhost:5000/api/locations";

export const getLocations = async (params = {}) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

export const getLocationById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createLocation = async (locationData) => {
  const res = await axios.post(API_URL, locationData);
  return res.data;
};

export const updateLocation = async (id, locationData) => {
  const res = await axios.put(`${API_URL}/${id}`, locationData);
  return res.data;
};

export const deleteLocation = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};