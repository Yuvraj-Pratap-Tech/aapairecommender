import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "I want something for my morning commute",
  "True crime but not too dark",
  "Help me fall asleep tonight",
  "Smart science talks under 30 min",
];

export function PodcastChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        const errBody = await resp.json().catch(() => ({ error: "Request failed" }));
        toast.error(errBody.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let done = false;

      const upsert = (chunk: string) => {
        assistantText += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantText } : m));
          }
          return [...prev, { role: "assistant", content: assistantText }];
        });
      };

      while (!done) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) upsert(c);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[70vh] min-h-[520px] w-full max-w-3xl mx-auto rounded-2xl bg-gradient-card border shadow-elegant overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-8">
            <div className="size-16 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <Headphones className="size-8 text-primary-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">What are you in the mood for?</h3>
              <p className="text-muted-foreground max-w-md">
                Tell me your vibe, a topic, or a podcast you already love — I'll find your next favorite listen.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-4 py-2 rounded-full text-sm border bg-secondary/40 hover:bg-secondary hover:border-primary/50 transition-smooth"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-gradient-hero text-primary-foreground shadow-glow"
                  : "bg-secondary/60 border"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none prose-strong:text-primary prose-em:text-accent prose-p:my-1 prose-ul:my-2">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-secondary/60 border rounded-2xl px-4 py-3 flex items-end gap-1 h-10">
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-1 h-4 bg-primary rounded-full animate-wave"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t bg-background/40 backdrop-blur p-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your mood, topic, or a show you love…"
          className="flex-1 bg-secondary/40 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 placeholder:text-muted-foreground"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-gradient-hero hover:opacity-90 text-primary-foreground shadow-glow rounded-xl px-5"
        >
          {isLoading ? <Sparkles className="size-4 animate-pulse" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
