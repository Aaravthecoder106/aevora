import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { domain, difficulty, availableHardware, customPrompt } =
      await request.json();

    const selectedDomain = domain || "Edge AI";
    const selectedDifficulty = difficulty || "Weekend Prototype";
    const hardware =
      Array.isArray(availableHardware) && availableHardware.length > 0
        ? availableHardware
        : ["ESP32-S3", "Next.js App Router"];

    const primaryHw = hardware[0] || "ESP32-S3";
    const secondaryHw = hardware[1] || "Transceiver Module";
    const userDescription = (customPrompt || "").trim();

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. Try real Google Gemini API generation if key is provided
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const promptText = `Domain: ${selectedDomain}
Target Scope / Timeframe: ${selectedDifficulty}
Selected Hardware Components: ${hardware.join(", ")}
${userDescription ? `Custom Project Concept & Requirements: "${userDescription}"` : "Concept: Design an autonomous, ultra-efficient proof-of-work system."}

Create an uncompromising, production-grade engineering build specification with real components, circuit considerations, and a realistic execution roadmap.`;

        const modelsToTry = [
          "gemini-2.5-flash",
          "gemini-1.5-flash",
          "gemini-2.0-flash",
        ];

        let geminiResponseText: string | null = null;
        let lastError: any = null;

        for (const modelName of modelsToTry) {
          try {
            const result = await ai.models.generateContent({
              model: modelName,
              contents: [{ role: "user", parts: [{ text: promptText }] }],
              config: {
                systemInstruction: `You are a Principal Hardware & AI Systems Architect for Aevora Forge.
Zero vaporware. Zero marketing hype. Generate a realistic, verified system architecture blueprint, bill of materials (BOM), and execution roadmap.
Respond ONLY with a valid, parseable JSON object matching this exact schema:
{
  "title": "Precise Engineering Project Name",
  "problemStatement": "Technical description of the problem, latency, power constraints, and why this architecture solves it (2-3 sentences).",
  "bom": [
    {
      "item": "Exact IC or component name",
      "purpose": "Technical function and subsystem",
      "estimatedCost": "$X.XX"
    }
  ],
  "techStack": ["Component 1", "Framework 2", ...],
  "architectureSteps": [
    "Stage 1: Technical step with buses (SPI/I2C/UART/CAN) and clock rates",
    "Stage 2: Buffer acquisition and DMA transfer",
    "Stage 3: Quantized heuristic inference or algorithmic filtering",
    "Stage 4: CRC16 packet transport and telemetry serialization",
    "Stage 5: Power gating down to low-power standby"
  ],
  "roadmapDays": [
    {
      "day": "Day 1-2",
      "task": "Specific hardware bringup task",
      "deliverable": "Measurable verifiable proof output (UART frames, logic analyzer trace)"
    },
    {
      "day": "Day 3-4",
      "task": "Subsystem integration and ring buffer logic",
      "deliverable": "Zero memory leak benchmark verification"
    },
    {
      "day": "Day 5",
      "task": "Client dashboard and telemetry transport bridge",
      "deliverable": "Live Next.js telemetry panel with sub-80ms updates"
    },
    {
      "day": "Day 6-7",
      "task": "Thermal dissipation, enclosure packaging, and final testing",
      "deliverable": "Working hardware demo video and open-source schematics"
    }
  ]
}`,
                responseMimeType: "application/json",
              },
            });

            if (result && typeof result.text === "string" && result.text.trim()) {
              geminiResponseText = result.text;
              break;
            }
          } catch (modelErr: any) {
            lastError = modelErr;
            // Continue to fallback model
          }
        }

        if (geminiResponseText) {
          // Parse JSON safely
          const cleanJson = geminiResponseText
            .replace(/^```json\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          const parsed = JSON.parse(cleanJson);

          const spec = {
            id: `spec-${Date.now()}`,
            title: parsed.title || `${primaryHw} Autonomous ${selectedDomain} Engine`,
            domain: selectedDomain,
            difficulty: selectedDifficulty,
            problemStatement:
              parsed.problemStatement ||
              `High power consumption and cloud latency degrade reliability in off-grid deployments. This build spec establishes an autonomous ${selectedDomain.toLowerCase()} subsystem.`,
            bom: Array.isArray(parsed.bom) ? parsed.bom : [],
            techStack: Array.isArray(parsed.techStack) ? parsed.techStack : hardware,
            architectureSteps: Array.isArray(parsed.architectureSteps)
              ? parsed.architectureSteps
              : [],
            roadmapDays: Array.isArray(parsed.roadmapDays) ? parsed.roadmapDays : [],
            generatedAt: new Date().toISOString(),
          };

          return NextResponse.json({
            success: true,
            spec,
            source: "gemini-api",
            model: "Google Gemini",
          });
        }

        console.warn("Gemini model execution fallback:", lastError?.message);
      } catch (geminiError: any) {
        console.warn("Gemini generation failed, using local engine:", geminiError?.message);
      }
    }

    // 2. High-signal Fallback Synthesis Engine (incorporates custom prompt)
    const customContext = userDescription
      ? ` Engineered to fulfill: "${userDescription}".`
      : "";

    const spec = {
      id: `spec-${Date.now()}`,
      title: userDescription
        ? `${primaryHw} ${userDescription.split(" ").slice(0, 3).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} System`
        : `${primaryHw} Autonomous ${selectedDomain} Engine`,
      domain: selectedDomain,
      difficulty: selectedDifficulty,
      problemStatement: `High power consumption and cloud latency degrade reliability in off-grid deployments. This build spec establishes an autonomous ${selectedDomain.toLowerCase()} subsystem utilizing ${hardware.join(
        ", "
      )} with sub-80ms local execution loops and strict hardware power gating.${customContext}`,
      bom: [
        {
          item: primaryHw,
          purpose: "Primary microcontroller, RTOS execution loop, and peripheral control",
          estimatedCost: "$4.90",
        },
        {
          item: secondaryHw,
          purpose: "Physical transport interface and telemetry pipeline",
          estimatedCost: "$6.40",
        },
        {
          item: "TI TPS62840 Low-Iq Step-Down Regulator",
          purpose: "95% efficient power rail with 60nA quiescent standby",
          estimatedCost: "$1.50",
        },
        {
          item: "3D Printed ASA / CNC Milled Enclosure",
          purpose: "Environmental sealing and EMI protection",
          estimatedCost: "$8.00",
        },
      ],
      techStack: [...hardware, "FreeRTOS", "Tailwind CSS"],
      architectureSteps: [
        "Stage 1: Peripheral initialization and watchdog timer calibration in bootstrap memory",
        "Stage 2: Interrupt-driven sensor buffer acquisition over SPI/I2C at 100Hz",
        "Stage 3: Quantized local heuristic filtering and state evaluation on-device",
        "Stage 4: Asynchronous packet dispatch over selected transport layer with CRC16 verification",
        "Stage 5: Conditional sleep power gate down to low-power standby mode",
      ],
      roadmapDays: [
        {
          day: "Day 1-2",
          task: "Hardware bringup, SPI bus pinout validation, and basic loopback verification",
          deliverable: "UART terminal output logging stable sensor frames at 115200 baud",
        },
        {
          day: "Day 3-4",
          task: "Implement core state machine, memory protection, and ring buffer management",
          deliverable: "Zero memory leakage across 10,000 synthetic benchmark cycles",
        },
        {
          day: "Day 5",
          task: "Build client dashboard interface and telemetry visualizer with local WebSocket",
          deliverable: "Responsive Next.js telemetry panel showing real-time metrics",
        },
        {
          day: "Day 6-7",
          task: "Stress testing under thermal load, power gate verification, and enclosure packaging",
          deliverable: "Final ship log with hardware demo video and open-source repo release",
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      spec,
      source: geminiApiKey ? "fallback-synthesis" : "offline-synthesis",
      note: geminiApiKey ? undefined : "Add GEMINI_API_KEY to .env.local to enable live Gemini LLM models",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate idea" },
      { status: 500 }
    );
  }
}
