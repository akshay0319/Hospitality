"use client";

import { useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AI_SAMPLE_CONVERSATIONS } from "@/constants/sample-data";

const QUICK_PROMPTS = [
  "Why did occupancy drop?",
  "Unsold rooms this weekend",
  "Top revenue opportunities",
];

export function AIQuickAsk() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  async function ask(q: string) {
    setQuery(q);
    setLoading(true);
    setAnswer(null);
    await new Promise((r) => setTimeout(r, 1200));
    const sample = AI_SAMPLE_CONVERSATIONS.find((m) => m.role === "assistant");
    setAnswer((sample?.content.slice(0, 320) ?? "") + "...");
    setLoading(false);
  }

  return (
    <Card className="h-full border-ai/20 bg-gradient-to-br from-base-surface to-ai-muted/30">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <div className="ai-orb" />
          <span className="text-sm font-semibold text-text-primary">AI Copilot</span>
          <span className="ml-auto text-2xs bg-ai/15 text-ai px-2 py-0.5 rounded-full font-semibold">✦ Powered by AI</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything about your property..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query && ask(query)}
            className="bg-base border-ai/30 focus:border-ai focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
          />
          <Button
            variant="ai"
            size="icon"
            onClick={() => query && ask(query)}
            disabled={!query || loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Quick prompts */}
        {!answer && !loading && (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => ask(p)}
                className="text-xs text-text-secondary border border-border hover:border-ai/50 hover:text-ai-hover px-2.5 py-1 rounded-md transition-all bg-base-elevated hover:bg-ai/5"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* AI Thinking */}
        {loading && (
          <div className="flex items-center gap-2 py-2">
            <div className="ai-orb" />
            <span className="text-sm text-text-secondary">Analyzing your data</span>
            <span className="flex gap-0.5 ml-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 bg-ai rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
        )}

        {/* AI Answer */}
        {answer && (
          <div className="rounded-lg border border-ai/20 bg-ai-muted/30 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-ai" />
              <span className="text-2xs font-semibold text-ai uppercase tracking-wide">AI Response</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line line-clamp-6">
              {answer}
            </p>
            <a href="/ai-copilot" className="text-xs text-ai hover:text-ai-hover mt-2 inline-flex items-center gap-1 transition-colors">
              View full analysis →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
