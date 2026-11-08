import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { domain, difficulty, availableHardware } = await request.json();

    const selectedDomain = domain || "Edge AI";
    const selectedDifficulty = difficulty || "Weekend Prototype";
    const hardware = Array.isArray(availableHardware) && availableHardware.length > 0
      ? availableHardware
      : ["ESP32-S3", "Next.js App Router"];

    const primaryHw = hardware[0] || "ESP32-S3";
    const secondaryHw = hardware[1] || "Transceiver Module";

    // Clean, structured spec synthesis
    const spec = {
      id: `spec-${Date.now()}`,
      title: `${primaryHw} Autonomous ${selectedDomain} Engine`,
      domain: selectedDomain,
      difficulty: selectedDifficulty,
      problemStatement: `High power consumption and cloud latency degrade reliability in off-grid deployments. This build spec establishes an autonomous ${selectedDomain.toLowerCase()} subsystem utilizing ${hardware.join(
        ", "
      )} with sub-80ms local execution loops and strict hardware power gating.`,
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

    return NextResponse.json({ success: true, spec });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate idea" },
      { status: 500 }
    );
  }
}
