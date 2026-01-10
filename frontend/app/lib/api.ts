import axios from "axios";
import { useUserStore } from "../store/userStore";

const instance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

instance.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers!["Authorization"] = `Bearer ${token}`;
  }
  return config;
});


instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default instance;
