export type VenueLocation = {
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  continent?: string;
  lat?: number;
  lng?: number;
};

export type VenueMeta = {
  wifi?: boolean;
  parking?: boolean;
  breakfast?: boolean;
  pets?: boolean;
};

export type Venue = {
  id: string;
  name: string;
  description: string;
  media?: NoroffMedia[];
  price: number;
  maxGuests: number;
  rating?: number;
  location?: VenueLocation;
  meta?: VenueMeta;

  bookings?: Booking[];
};

export type NoroffMedia = {
  url: string;
  alt?: string;
};

export type PaginationMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

export type NoroffResponse<T> = {
  data: T;
  meta: PaginationMeta;
};

export type Booking = {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  created: string;
  updated: string;
  venue?: Venue;
};
