import { apiFetch } from "./api";
import type { NoroffResponse } from "./types";

export type Profile = {
  name: string;
  email: string;
  avatar?: { url: string; alt?: string };
  venueManager?: boolean;
};

export async function getProfile(name: string, token: string) {
  return apiFetch<NoroffResponse<Profile>>(`/holidaze/profiles/${name}`, { token });
}

export async function updateAvatar(name: string, avatarUrl: string, token: string) {
  return apiFetch<NoroffResponse<Profile>>(`/holidaze/profiles/${name}`, {
    method: "PUT",
    token,
    body: { avatar: { url: avatarUrl, alt: "User avatar" } },
  });
}
