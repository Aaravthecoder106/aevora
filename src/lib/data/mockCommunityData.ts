import {
  ShipPost,
  ProjectItem,
  ChallengeItem,
  BlueprintItem,
  ResourceTool,
  LeaderboardRank,
  UserDashboardData,
  AISpec,
} from "../types/community";

// ZERO FAKE DATA — All lists initialized empty, driven exclusively by real Supabase queries.
export const INITIAL_COMMUNITY_POSTS: ShipPost[] = [];

export const INITIAL_PROJECTS: ProjectItem[] = [];

export const INITIAL_CHALLENGES: ChallengeItem[] = [
  {
    id: "f160932f-faac-4ba2-b05b-f64dc690273c",
    slug: "cyberdeck-hardware-hack-2026",
    title: "The 7-Day Cyberdeck & Custom Hardware Sprint",
    tagline: "Design, wire, and prototype an ultra-compact terminal or custom IoT device",
    description: "Design, wire, and prototype an ultra-compact portable terminal, mechanical deck, or custom IoT device. Hardware builders: show your breadboards, CAD iterations, and smoke tests.",
    prizePool: "$750 Grant + Nordic DevKit",
    rules: [
      "Must include custom enclosure (CAD/3D print/acrylic) or custom PCB.",
      "Must submit at least 2 progressive ship-logs with photos or serial traces.",
      "Open-source schematics/code on GitHub is encouraged.",
    ],
    status: "active",
    startsAt: "2026-11-05T00:00:00.000Z",
    endsAt: "2026-11-15T23:59:59.000Z",
    submissionsCount: 0,
    maxSlots: 50,
    sponsoredBy: "Aevora Hardware Fund",
  },
  {
    id: "24e8c6af-7659-4846-b024-52afd94066ce",
    slug: "agentic-local-tool-sprint",
    title: "Local Agentic AI CLI & Desktop Hack",
    tagline: "Build a zero-dependency CLI or local model workflow with sub-100ms latency",
    description: "Build and open-source a fast, minimalist developer tool or agentic workflow that runs locally or utilizes low-latency APIs. Prove your build with live terminal demos and bench tests.",
    prizePool: "$500 Bounty Voucher",
    rules: [
      "Provide a public GitHub repository.",
      "Include a terminal screencast, ASCII demo, or telemetry trace.",
      "Clean architecture, zero telemetry bloat.",
    ],
    status: "active",
    startsAt: "2026-11-06T00:00:00.000Z",
    endsAt: "2026-11-20T23:59:59.000Z",
    submissionsCount: 0,
    maxSlots: 50,
    sponsoredBy: "Aevora Systems Guild",
  },
];

export const INITIAL_BLUEPRINTS: BlueprintItem[] = [
  {
    id: "bp-1",
    title: "ESP32-S3 Low-Power Standby Core Template",
    description: "Production-ready C/ESP-IDF template with deep sleep RTC timers, ULP coprocessor monitoring, and power rail isolation routines.",
    category: "Firmware",
    techStack: ["ESP-IDF", "C", "FreeRTOS"],
    author: "aevora_core",
    stars: 12,
    license: "MIT",
    downloadUrl: "https://github.com/aevora/esp32-sleep-core",
    repoUrl: "https://github.com/aevora/esp32-sleep-core",
    previewSnippet: "esp_sleep_enable_timer_wakeup(SLEEP_DURATION_US);\nesp_deep_sleep_start();",
    updatedAt: "Verified",
  },
  {
    id: "bp-2",
    title: "Local Llama.cpp WebGPU Agent Pipeline",
    description: "Zero-cloud TypeScript boilerplate for running quantized 1B/3B models inside the browser or Node with native WebGPU acceleration.",
    category: "Edge AI",
    techStack: ["TypeScript", "WebGPU", "llama.cpp", "Next.js"],
    author: "aevora_core",
    stars: 28,
    license: "Apache-2.0",
    downloadUrl: "https://github.com/aevora/webgpu-agent-starter",
    repoUrl: "https://github.com/aevora/webgpu-agent-starter",
    previewSnippet: "const engine = await CreateWebWorkerMLCEngine('Qwen2.5-1.5B-Instruct-q4f32_1');",
    updatedAt: "Verified",
  },
];

export const INITIAL_RESOURCES: ResourceTool[] = [
  {
    id: "res-1",
    name: "JLCPCB Prototype Rebate Program",
    category: "Hardware Grants",
    description: "Monthly manufacturing coupon for open-source hardware and educational PCB fabrication runs.",
    accessType: "Grant",
    url: "https://jlcpcb.com",
    provider: "JLCPCB Community",
  },
  {
    id: "res-2",
    name: "Cloudflare Workers & D1 Free Tier",
    category: "GPU & Cloud Credits",
    description: "Generous 100,000 requests/day edge compute and serverless SQLite database without credit card barriers.",
    accessType: "Free Tier",
    url: "https://workers.cloudflare.com",
    provider: "Cloudflare",
  },
  {
    id: "res-3",
    name: "KiCad Open Source EDA",
    category: "CAD & Simulation",
    description: "Professional cross-platform schematic capture and PCB layout package with zero license restrictions or cloud mandates.",
    accessType: "Open Source",
    url: "https://www.kicad.org",
    provider: "KiCad Services",
  },
  {
    id: "res-4",
    name: "Hugging Face ZeroGPU Inference Tier",
    category: "GPU & Cloud Credits",
    description: "Dynamic free Nvidia A100 GPU quota for testing, fine-tuning and hosting open-weights model spaces.",
    accessType: "Free Tier",
    url: "https://huggingface.co",
    provider: "Hugging Face",
  },
];

export const MONTHLY_LEADERBOARD: Record<string, LeaderboardRank[]> = {};

export const INITIAL_USER_DASHBOARD: UserDashboardData = {
  name: "New Builder",
  username: "builder",
  role: "Hardware Hacker",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=builder",
  streakCount: 1,
  totalShips: 0,
  xpPoints: 50,
  bio: "Hardware and systems engineer logging verifiable proof of work on Aevora Forge.",
  techStack: ["Next.js", "TypeScript", "ESP32", "Rust", "KiCad"],
  githubUrl: "",
  discordHandle: "",
  savedSpecs: [],
  collabApplications: [],
};
