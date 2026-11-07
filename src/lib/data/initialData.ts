import { Challenge, Profile, ShipLog } from "../supabase/types";

export const SEED_PROFILES: Record<string, Profile> = {};

export const SEED_CHALLENGES: Challenge[] = [
  {
    id: "f160932f-faac-4ba2-b05b-f64dc690273c",
    slug: "cyberdeck-hardware-hack-2026",
    title: "The 7-Day Cyberdeck & Custom Hardware Sprint",
    description: "Design, wire, and prototype an ultra-compact portable terminal, mechanical deck, or custom IoT device. Hardware builders: show your breadboards, CAD iterations, and smoke tests.",
    rules: "1. Must include at least 1 custom enclosure (CAD/3D print/acrylic) or custom PCB.\n2. Must submit at least 2 progressive ship-logs with photos or video proof.\n3. Open-source schematics/code on GitHub is encouraged.",
    status: "active",
    starts_at: "2026-11-06T00:00:00.000Z",
    ends_at: "2026-11-13T12:00:00.000Z",
    winner_profile_id: null,
    created_at: "2026-11-06T00:00:00.000Z",
  },
  {
    id: "24e8c6af-7659-4846-b024-52afd94066ce",
    slug: "agentic-local-tool-sprint",
    title: "Local Agentic AI CLI & Desktop Hack",
    description: "Build and open-source a fast, minimalist developer tool or agentic workflow that runs locally or utilizes low-latency APIs. Prove your build with live terminal demos and bench tests.",
    rules: "1. Provide a public GitHub repository.\n2. Include a terminal screencast, ASCII demo, or Loom video.\n3. Clean architecture, zero telemetry bloat.",
    status: "active",
    starts_at: "2026-11-07T00:00:00.000Z",
    ends_at: "2026-11-20T18:00:00.000Z",
    winner_profile_id: null,
    created_at: "2026-11-07T00:00:00.000Z",
  },
  {
    id: "a72c8538-6f2f-4a41-95a5-4c316169c0b9",
    slug: "esp32-solar-telemetry-challenge",
    title: "Off-Grid LoRa & Solar Telemetry Rig",
    description: "Build a weather-resistant remote node that broadcasts telemetry over LoRa or BLE with ultra-low sleep current.",
    rules: "1. Report current draw in deep sleep (< 20uA target).\n2. Field-tested outdoor photo required.",
    status: "completed",
    starts_at: "2026-10-14T00:00:00.000Z",
    ends_at: "2026-11-04T00:00:00.000Z",
    winner_profile_id: null,
    created_at: "2026-10-14T00:00:00.000Z",
    winner: null,
  },
];

export const SEED_SHIP_LOGS: ShipLog[] = [];
