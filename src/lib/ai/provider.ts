import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

/**
 * Provider-agnostic model factory (MASTER PROMPT s33).
 * Switch providers via env only - business logic never changes.
 *   AI_PROVIDER = "anthropic" | "openai"
 *   AI_MODEL    = model id for that provider
 * Env fallback: accepts legacy var name "APIKey" as well.
 */
export function getModel(): LanguageModel {
    const provider = (process.env.AI_PROVIDER ?? "google").toLowerCase();
    const modelId = process.env.AI_MODEL ?? defaultModel(provider);

  if (provider === "openai") {
        const openai = createOpenAI({
                apiKey: process.env.OPENAI_API_KEY ?? process.env.AI_API_KEY ?? process.env.APIKey,
        });
        return openai(modelId);
  }
    if (provider === "google") return createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY ?? process.env.AI_API_KEY ?? process.env.APIKey })(modelId);

  const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY ?? process.env.AI_API_KEY ?? process.env.APIKey,
  });
    return anthropic(modelId);
}

function defaultModel(provider: string): string {
    if (provider === "openai") return "gpt-4o-mini"; if (provider === "anthropic") return "claude-sonnet-4-5"; return "gemini-2.0-flash";
}
