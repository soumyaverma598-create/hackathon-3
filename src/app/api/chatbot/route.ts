import { NextRequest, NextResponse } from 'next/server';
import type { Language } from '@/lib/translations';
import {
  AssistantMessage,
  LiveUserContext,
  buildAssistantSystemPrompt,
  getAssistantFallbackReply,
} from '@/lib/siteAssistant';

const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

interface ChatbotRequestBody {
  messages?: AssistantMessage[];
  language?: Language;
  pathname?: string;
  context?: LiveUserContext;
}

type ChatFallbackReason = 'missing_api_key' | 'rate_limited' | 'upstream_error';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ChatbotRequestBody | null;
  const messages = sanitizeMessages(body?.messages ?? []);
  const language = body?.language ?? 'en';
  const pathname = body?.pathname ?? '/';
  const context = body?.context;

  if (messages.length === 0) {
    return NextResponse.json(
      { success: false, error: 'At least one message is required.' },
      { status: 400 }
    );
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');
  if (!latestUserMessage) {
    return NextResponse.json(
      { success: false, error: 'A user message is required.' },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      data: {
        reply: getAssistantFallbackReply(latestUserMessage.content, language),
        mode: 'fallback',
        reason: 'missing_api_key' satisfies ChatFallbackReason,
      },
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: buildGeminiContents(messages, language, pathname, context),
          generationConfig: {
            temperature: 0.35,
            topP: 0.9,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Gemini request failed with ${response.status}`);
    }

    const payload = (await response.json()) as GeminiResponse;
    const reply = extractReply(payload);

    if (!reply) {
      throw new Error('No assistant reply was returned by Gemini.');
    }

    return NextResponse.json({
      success: true,
      data: {
        reply,
        mode: 'gemini',
      },
    });
  } catch (error) {
    const reason = getFallbackReason(error);

    return NextResponse.json({
      success: true,
      data: {
        reply: getAssistantFallbackReply(latestUserMessage.content, language),
        mode: 'fallback',
        reason,
      },
    });
  }
}

function sanitizeMessages(messages: AssistantMessage[]) {
  return messages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0
    )
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }));
}

function buildGeminiContents(
  messages: AssistantMessage[],
  language: Language,
  pathname: string,
  context?: LiveUserContext,
) {
  return [
    {
      role: 'user',
      parts: [{ text: buildAssistantSystemPrompt(language, pathname, context) }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I will stay focused on this portal and provide workflow-specific guidance.' }],
    },
    ...messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    })),
  ];
}

function extractReply(payload: GeminiResponse) {
  return payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();
}

function getFallbackReason(error: unknown): ChatFallbackReason {
  const message = error instanceof Error ? error.message : String(error ?? '');

  if (message.includes('429')) {
    return 'rate_limited';
  }

  return 'upstream_error';
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}