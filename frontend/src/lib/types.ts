export type NominationGender = "boys" | "girls";

export interface Nomination {
  id: string;
  name: string;
  gender: NominationGender;
  bodyweight: number;
  category: string;
  squat: number | null;
  bench: number | null;
  deadlift: number | null;
  total: number | null;
  source_row: number;
}

export interface NominationsResponse {
  source_url: string;
  synced_at: string;
  nominations: Nomination[];
  total_nominations: number;
  boys_count: number;
  girls_count: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number | null;
  lifter: string;
  team: string;
  event: string;
  division: string;
  age: number | null;
  bodyweight: number | null;
  category: string;
  squat: number | null;
  bench: number | null;
  deadlift: number | null;
  total: number | null;
  dots: number | null;
  source_row: number;
}

export interface LeaderboardResponse {
  source_url: string;
  synced_at: string;
  entries: LeaderboardEntry[];
  total_entries: number;
}

export interface LiveScoreRow {
  id: string;
  values: Record<string, string>;
  source_row: number;
}

export interface LiveScoreResponse {
  source_url: string;
  synced_at: string;
  headers: string[];
  rows: LiveScoreRow[];
  total_rows: number;
}
