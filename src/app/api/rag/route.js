import OpenAI from "openai";

import { systemInstruction } from "@/ai/systemInstruction";
import { responseStyle } from "@/ai/responseStyle";
import { safetyRules } from "@/ai/safetyRules";
import { confidenceCalibration } from "@/ai/confidenceCalibration";
import { clarificationStrategy } from "@/ai/clarificationStrategy";
import { documentAnalysisGuidance } from "@/ai/documentAnalysisGuidance";
import { imageAnalysisGuide } from "@/ai/imageAnalysisGuide";
import { regulatoryEvidenceGuidance } from "@/ai/regulatoryEvidenceGuidance";
import { assistantRoleAndValue } from "@/ai/assistantRoleAndValue";
import { operationalReasoningPolicy } from "@/ai/operationalReasoningPolicy";

function isOperationalScenario(question) {
  if (!question) return false;

  const q = question.toLowerCase();

  return (
    q.includes("can we") ||
    q.includes("should we") ||
    q.includes("continue") ||
    q.includes("stop") ||
    q.includes("suspend") ||
    q.includes("operation") ||
    q.includes("cargo") ||
    q.includes("ballast") ||
    q.includes("bunkering") ||
    q.includes("terminal") ||
    q.includes("pressure") ||
    q.includes("limit") ||
    q.includes("risk")
  );
}

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== SSE helper =====

function sse(event, data) {
  const safe = String(data ?? "").replace(/\n/g, "\\n");
  return `event: ${event}\ndata: ${safe}\n\n`;
}

// ===== POST handler =====

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      question,
      chatHistory = [], 
      summary = "",
      imageUrls = [],
    } = body;

    const basePrompt = [
  systemInstruction,
  assistantRoleAndValue,
  responseStyle,
  safetyRules,
  confidenceCalibration,
  clarificationStrategy,
].join("\n\n---\n\n");

const contextualBlocks = [
  imageUrls.length > 0 ? imageAnalysisGuide : null,
  isOperationalScenario(question) ? operationalReasoningPolicy : null,
  imageUrls.length > 0 ? documentAnalysisGuidance : null,
].filter(Boolean);

const assembledSystemPrompt = [
  basePrompt,
  ...contextualBlocks,
].join("\n\n---\n\n");

    const isImageMode = Array.isArray(imageUrls) && imageUrls.length > 0;

    if (!process.env.OPENAI_API_KEY) {
      return new Response(sse("error", "Missing OPENAI_API_KEY"), {
        status: 500,
        headers: { "Content-Type": "text/event-stream; charset=utf-8" },
      });
    }

    if (!question || !String(question).trim()) {
      return new Response(sse("error", "Question is required"), {
        status: 400,
        headers: { "Content-Type": "text/event-stream; charset=utf-8" },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start: async (controller) => {
        try {
          controller.enqueue(encoder.encode(sse("status", "start")));

          const summaryBlock = summary
  ? {
      role: "system",
      content: `
IMPORTANT CONTEXT FROM EARLIER IN THIS CHAT.
This information MUST be considered when answering the user.
${summary}
`,
}
  : null;

         const messages = [
  {
    role: "system",
    content: assembledSystemPrompt,
  },
  
  ...(summaryBlock ? [summaryBlock] : []),

  ...chatHistory.map((m) => ({
    role: m.role,
    content: String(m.content),
  })),

  {
  role: "user",
  content: [
    { type: "text", text: String(question) },
    ...imageUrls.map((url) => ({
      type: "image_url",
      image_url: { url },
    })),
  ],
},
];

          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            stream: true,
            messages,
          });

          for await (const chunk of completion) {
            const token = chunk?.choices?.[0]?.delta?.content;
            if (token) {
              controller.enqueue(encoder.encode(sse("token", token)));
            }
          }

          controller.enqueue(encoder.encode(sse("status", "done")));
          controller.close();
        } catch (e) {
          controller.enqueue(
            encoder.encode(sse("error", e?.message || String(e)))
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(sse("error", "Bad request"), {
      status: 400,
      headers: { "Content-Type": "text/event-stream; charset=utf-8" },
    });
  }
}
