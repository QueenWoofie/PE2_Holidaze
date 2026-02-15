import { apiFetch } from "./api";
import type { NoroffResponse, Venue } from "./types";

export async function getVenueWithBookings(id: string, token: string) {
  return apiFetch<NoroffResponse<Venue>>(`/holidaze/venues/${id}?_bookings=true`, { token });
}

export type CreateVenueBody = {
  name: string;
  description: string;
  media?: { url: string; alt?: string }[];
  price: number;
  maxGuests: number;
  meta?: {
    wifi?: boolean;
    parking?: boolean;
    breakfast?: boolean;
    pets?: boolean;
  };
  location?: {
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    continent?: string;
  };
};

export async function getMyVenues(profileName: string, token: string) {
  return apiFetch<NoroffResponse<Venue[]>>(`/holidaze/profiles/${profileName}/venues`, { token });
}

export async function createVenue(body: CreateVenueBody, token: string) {
  return apiFetch<NoroffResponse<Venue>>("/holidaze/venues", { method: "POST", token, body });
}

export async function updateVenue(id: string, body: Partial<CreateVenueBody>, token: string) {
  return apiFetch<NoroffResponse<Venue>>(`/holidaze/venues/${id}`, { method: "PUT", token, body });
}

export async function deleteVenue(id: string, token: string) {
  return apiFetch<NoroffResponse<unknown>>(`/holidaze/venues/${id}`, { method: "DELETE", token });
}
