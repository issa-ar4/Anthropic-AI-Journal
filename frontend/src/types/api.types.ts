export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface EntriesResponse {
  entries: JournalEntry[];
  pagination: PaginationData;
}
