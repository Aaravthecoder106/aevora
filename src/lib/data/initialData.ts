import { Challenge, Profile, ShipLog } from "../supabase/types";

export const DUMMY_SEED_CHALLENGE_IDS = [
  "f160932f-faac-4ba2-b05b-f64dc690273c",
  "24e8c6af-7659-4846-b024-52afd94066ce",
  "a72c8538-6f2f-4a41-95a5-4c316169c0b9",
];

export const SEED_PROFILES: Record<string, Profile> = {};

export const SEED_CHALLENGES: Challenge[] = [];

export const SEED_SHIP_LOGS: ShipLog[] = [];
