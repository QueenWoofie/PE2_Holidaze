import { apiFetch } from "./api";

type RegisterBody = {
  name: string;
  email: string;
  password: string;
  venueManager?: boolean;
};

type LoginBody = {
  email: string;
  password: string;
};

type AuthResponse = {
  data: {
    name: string;
    email: string;
    accessToken: string;
    venueManager?: boolean;
  };
};

export async function registerUser(body: RegisterBody) {
  return apiFetch<AuthResponse>("/auth/register", { method: "POST", body });
}

export async function loginUser(body: LoginBody) {
  return apiFetch<AuthResponse>("/auth/login?_holidaze=true", { method: "POST", body });
}

export function saveAuth(auth: {
  accessToken: string;
  name: string;
  email: string;
  venueManager?: boolean;
}) {
  localStorage.setItem("holidaze_token", auth.accessToken);
  localStorage.setItem("holidaze_name", auth.name);
  localStorage.setItem("holidaze_email", auth.email);
  localStorage.setItem("holidaze_venueManager", String(Boolean(auth.venueManager)));
}

export function isVenueManager() {
  return localStorage.getItem("holidaze_venueManager") === "true";
}

export function clearAuth() {
  localStorage.removeItem("holidaze_token");
  localStorage.removeItem("holidaze_name");
  localStorage.removeItem("holidaze_email");
  localStorage.removeItem("holidaze_venueManager");
}

export function getToken() {
  return localStorage.getItem("holidaze_token");
}
