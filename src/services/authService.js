import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const loginRequest = async (data) => {
  const { data: response } = await axios.post(`${API}/auth/login`, data);
  console.log(import.meta.env.VITE_API_URL);

  return response; // ahora sí: { success, token, user }
};
