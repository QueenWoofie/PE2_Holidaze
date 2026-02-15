import { apiFetch } from "./api";
import type { Booking, NoroffResponse } from "./types";

export type CreateBookingBody = {
  dateFrom: string;
  dateTo: string;
  guests: number;
  venueId: string;
};

export async function createBooking(body: CreateBookingBody, token: string) {
  return apiFetch<NoroffResponse<Booking>>("/holidaze/bookings", {
    method: "POST",
    token,
    body,
  });
}

export async function getBookingsByProfile(profileName: string, token: string) {
  return apiFetch<NoroffResponse<Booking[]>>(
    `/holidaze/profiles/${profileName}/bookings?_venue=true`,
    { token },
  );
}

export async function deleteBooking(id: string, token: string) {
  return apiFetch<NoroffResponse<unknown>>(`/holidaze/bookings/${id}`, {
    method: "DELETE",
    token,
  });
}
