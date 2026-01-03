import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// USERS
export const getUsers = () => API.get("/users");
export const getUserById = (id) => API.get(`/user/id/${id}`);
export const getUserByName = (name) => API.get(`/user/name/${name}`);

// AUTH
export const createUser = (userData) => API.post("/register", userData);
export const loginUser = (credentials) => API.post("/login", credentials);

// UPDATE / DELETE
export const updateUser = (id, userData) => API.put(`/user/${id}`, userData);
export const deleteUser = (id) => API.delete(`/user/${id}`);
// ACTIVATE USER / DEACTIVATE USER
export const activateUser = (id) => API.patch(`/user/activate/${id}`);
export const deactivateUser = (id) => API.patch(`/user/deactivate/${id}`);
export const activateUserByName = (name) => API.patch(`/user/activate/name/${name}`);