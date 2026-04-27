"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, SendHorizonal, Sparkles, User2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const responseMap = [
  {
    keywords: ["automation", "workflow", "ops"],
    content:
      "We can automate lead routing, CRM updates, inbox triage, and internal workflows with AI copilots and no-code orchestration.",
  },
  {
    keywords: ["website", "design", "landing"],
    content:
      "For websites, we focus on conversion-first UX, fast Next.js builds, clear messaging, and polished handoff-ready systems.",
  },
  {
    keywords: ["marketing", "content", "seo"],
    content:
      "Our AI marketing stack handles campaign ideation, content production, repurposing, analytics summaries, and SEO briefs.",
  },
  {
    keywords: ["app", "dashboard", "product"],
    content:
      "We design AI web apps with secure auth, custom workflows, analytics layers, and model integrations tailored to operations teams.",
  },
];

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hi, I’m the AIeasy demo assistant. Ask about automation, AI apps, websites, content, or marketing use cases.",
  },
];

export function AIDemoChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);

  const promptSuggestions = useMemo(
    () => [
      "How can you automate lead qualification?",
      "What do your AI web apps include?",
      "Can AIeasy help with website redesign?",
    ],
    [],
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getAssistantReply = (value: string) => {
    const normalized = value.toLowerCase();

    return (
      responseMap.find(({ keywords }) =>
        keywords.some((keyword) => normalized.includes(keyword)),
      )?.content ??
      "AIeasy helps teams blend product design, AI automation, and engineering execution into a single delivery workflow. Tell me what you need to improve."
    );
  };

  const sendMessage = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed || isTyping) {
      return;
    }

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: getAssistantReply(trimmed) },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader className="border-b border-[#E5E7EB] bg-[#FAFAF8] px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">AI Demo Chat</p>
              <p className="text-sm text-[#6B7280]">
                Simulated assistant trained on AIeasy services
              </p>
            </div>
          </div>
          <Badge className="rounded-full bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/10">
            Live simulation
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[420px] px-6 py-5">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Bot className="h-4 w-4" />
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 ${
                    message.role === "assistant"
                      ? "bg-[#FAFAF8] text-[#1A1A1A]"
                      : "bg-[#2563EB] text-white"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "user" ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A]/5 text-[#1A1A1A]">
                    <User2 className="h-4 w-4" />
                  </div>
                ) : null}
              </div>
            ))}

            {isTyping ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-[1.25rem] bg-[#FAFAF8] px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-blink" />
                  <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-blink [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-blink [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-[#E5E7EB] px-6 py-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion)}
                className="rounded-full border border-[#E5E7EB] bg-[#FAFAF8] px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about AIeasy solutions..."
              className="h-12 rounded-full border-[#E5E7EB] bg-[#FAFAF8] px-5"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8]"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
