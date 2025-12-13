import apiClient from "@/app/services/apiClient";

export const signup = async (email: string, password: string) => {
  const { data } = await apiClient.post("/auth/signup", { email, password });
  return data; // returns { success, message, user }
};

export const login = async (email: string, password: string) => {
  const { data } = await apiClient.post("/auth/login", { email, password });

  if (data.session?.access_token) {
    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data; // returns { success, message, session, user }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.cookie = "token=; Max-Age=0; path=/;";
  window.location.href = "/";
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
