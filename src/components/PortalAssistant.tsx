'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  Bot,
  LoaderCircle,
  MessageCircleMore,
  Minimize2,
  SendHorizontal,
  Sparkles,
} from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import {
  AssistantMessage,
  assistantQuickPrompts,
  assistantUiCopy,
  assistantWelcome,
} from '@/lib/siteAssistant';

const starterMessage = (language: keyof typeof assistantWelcome): AssistantMessage => ({
  role: 'assistant',
  content: assistantWelcome[language],
});

export default function PortalAssistant() {
  const pathname = usePathname();
  const language = useLanguageStore((state) => state.language);
  const copy = assistantUiCopy[language];
  const quickPrompts = assistantQuickPrompts[language];

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastMode, setLastMode] = useState<'gemini' | 'fallback' | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [starterMessage(language)]);

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((current) => {
      if (
        current.length === 1 &&
        current[0]?.role === 'assistant' &&
        Object.values(assistantWelcome).includes(current[0].content)
      ) {
        return [starterMessage(language)];
      }

      return current;
    });
  }, [language]);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  async function submitMessage(messageText?: string) {
    const trimmed = (messageText ?? input).trim();
    if (!trimmed || isSending) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: trimmed } as AssistantMessage];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: nextMessages,
          language,
          pathname,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with ${response.status}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: { reply?: string; mode?: 'gemini' | 'fallback' };
      };

      const reply = payload.data?.reply?.trim();
      if (!reply) {
        throw new Error('No reply from assistant.');
      }

      setLastMode(payload.data?.mode ?? null);
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch {
      setLastMode('fallback');
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: copy.unavailable,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitMessage();
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 sm:bottom-6 sm:right-6">
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.section
            key="assistant-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-cyan-100/70 bg-white/92 shadow-[0_24px_70px_rgba(8,34,54,0.22)] backdrop-blur-2xl"
          >
            <div className="relative overflow-hidden border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(8,34,54,0.98),rgba(22,78,99,0.94),rgba(37,201,208,0.84))] px-5 py-4 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_38%)]" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cyan-50">
                    <Sparkles className="h-3.5 w-3.5" />
                    {copy.title}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{copy.subtitle}</p>
                  <p className="mt-1 text-xs text-cyan-50/90">PARIVESH 3.0 workflow and page guidance</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/18"
                  aria-label="Minimize assistant"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={viewportRef} className="max-h-[26rem] space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#f8fdff_0%,#edf8fd_100%)] px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.content.slice(0, 18)}`}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={[
                      'max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
                      message.role === 'assistant'
                        ? 'rounded-bl-md border border-cyan-100 bg-white text-slate-700'
                        : 'rounded-br-md bg-[linear-gradient(135deg,#164e63,#25c9d0)] text-white',
                    ].join(' ')}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {messages.length <= 1 ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {copy.suggested}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => void submitMessage(prompt)}
                        className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-100"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-cyan-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-200/80 bg-white/92 p-4">
              {lastMode === 'fallback' ? (
                <p className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {copy.unavailable}
                </p>
              ) : null}

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-2 shadow-inner">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onKeyDown}
                  rows={3}
                  placeholder={copy.placeholder}
                  className="w-full resize-none bg-transparent px-2 py-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <div className="mt-2 flex items-center justify-between gap-3 px-1 pb-1">
                  <p className="text-[0.7rem] text-slate-400">Shift + Enter for a new line</p>
                  <button
                    type="button"
                    onClick={() => void submitMessage()}
                    disabled={isSending || !input.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#164e63,#25c9d0)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <SendHorizontal className="h-4 w-4" />
                    {copy.send}
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.button
            key="assistant-trigger"
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="group flex items-center gap-3 rounded-full border border-cyan-100/80 bg-white/90 px-3 py-3 pr-5 shadow-[0_22px_60px_rgba(8,34,54,0.2)] backdrop-blur-xl transition hover:-translate-y-0.5"
            aria-label="Open portal assistant"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#164e63,#25c9d0)] text-white shadow-lg">
              <Bot className="h-5 w-5" />
            </span>
            <span className="min-w-0 text-left">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                {copy.welcomeBadge}
                <MessageCircleMore className="h-4 w-4 text-cyan-600 transition group-hover:translate-x-0.5" />
              </span>
              <span className="block text-xs text-slate-500">PARIVESH live guide</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}