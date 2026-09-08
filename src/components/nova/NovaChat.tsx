"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  SparklesIcon,
  SendIcon,
  BotIcon,
  UserIcon,
  AlertCircleIcon,
  ShieldAlertIcon,
  RefreshCwIcon,
  InfoIcon,
} from "lucide-react";
import { sendNovaChatMessage, getNovaPersonalizationStatus } from "@/lib/actions/nova";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "Why do my gums bleed when I brush or floss?",
  "How can I reduce tooth sensitivity to cold drinks?",
  "What causes morning bad breath and how can I fix it?",
  "How often should I change my manual or electric toothbrush?",
  "What are early warning signs of a cavity?",
  "How does sugar impact tooth enamel?",
];

export default function NovaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAssessment, setHasAssessment] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function checkPersonalization() {
      const status = await getNovaPersonalizationStatus();
      setHasAssessment(status.hasAssessment);
    }
    checkPersonalization();
  }, []);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setError(null);
    setInputMessage("");

    const userMessageObj: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMessageObj];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Prepare history payload for server action
      const historyPayload = updatedMessages.slice(0, -1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendNovaChatMessage({
        message: query,
        history: historyPayload,
      });

      if (!response.success) {
        const errorMsg = response.error || "Failed to receive response from Nova.";
        setError(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      const novaReplyObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: response.reply!,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, novaReplyObj]);
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setError(null);
    setInputMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* DISCLAIMER BANNER */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-amber-700 dark:text-amber-300 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlertIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Educational Assistant Only:</strong> Nova provides oral health guidance and answers. Nova is not a dentist and does not provide clinical diagnoses or prescriptions.
          </span>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetChat}
            className="text-xs h-7 px-2 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 rounded-lg shrink-0"
          >
            <RefreshCwIcon className="w-3 h-3 mr-1" /> New Chat
          </Button>
        )}
      </div>

      {/* CHAT CONTAINER CARD */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden flex flex-col h-[650px] max-h-[80vh]">
        {/* CARD HEADER */}
        <CardHeader className="px-6 py-4 border-b border-border/50 bg-muted/30 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white shadow-md">
                <BotIcon className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-foreground">Nova</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold px-2">
                  AI Dental Assistant
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                <span>Powered by SmileSync AI</span>
                {hasAssessment === true && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <SparklesIcon className="w-3 h-3 text-emerald-500" /> Personalized using your assessment
                  </span>
                )}
                {hasAssessment === false && (
                  <Link href="/assessment" className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 transition-colors">
                    <span>Complete assessment to personalize Nova</span>
                    <ChevronRightIcon className="w-3 h-3" />
                  </Link>
                )}
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground border-border/60">
            <SparklesIcon className="w-3 h-3 text-primary" /> Gemini 3.6 Flash
          </Badge>
        </CardHeader>

        {/* CHAT MESSAGES AREA */}
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-muted">
          {messages.length === 0 ? (
            /* WELCOME / EMPTY STATE */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto py-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-cyan-500/10 border border-primary/20 text-primary shadow-inner">
                <SparklesIcon className="w-10 h-10 animate-pulse text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">Hi! I&apos;m Nova 👋</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your dedicated AI dental assistant. Ask me anything about tooth sensitivity, gum care, daily oral hygiene, or general dental health questions!
                </p>
              </div>

              {/* SUGGESTED QUESTION CHIPS */}
              <div className="w-full space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left pl-1 flex items-center gap-1.5">
                  <InfoIcon className="w-3.5 h-3.5 text-primary" /> Suggested Questions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="p-3 rounded-xl border border-border/70 bg-card hover:bg-primary/5 hover:border-primary/40 text-xs text-foreground/90 transition-all text-left flex items-start gap-2 group shadow-xs"
                    >
                      <SparklesIcon className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* MESSAGE LIST */
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" && (
                    <div className="size-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                      <BotIcon className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-xs shadow-md"
                          : "bg-muted/60 border border-border/60 text-foreground rounded-tl-xs shadow-xs"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div
                      className={`text-[10px] text-muted-foreground/70 px-1 ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="size-8 rounded-xl bg-secondary text-secondary-foreground border border-border flex items-center justify-center shrink-0 shadow-sm mt-1">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* TYPING INDICATOR */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="size-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <BotIcon className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-xs bg-muted/60 border border-border/60 text-foreground text-sm flex items-center gap-2">
                    <div className="flex gap-1.5 items-center">
                      <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-2 rounded-full bg-primary animate-bounce" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 font-medium">Nova is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        {/* ERROR NOTICE */}
        {error && (
          <div className="px-4 py-2.5 bg-destructive/10 border-t border-destructive/20 text-destructive text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="h-6 text-[10px] text-destructive hover:bg-destructive/20"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* CHAT INPUT AREA */}
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Nova a question about teeth, gums, or oral care..."
                disabled={isLoading}
                className="min-h-[48px] max-h-[120px] py-3 px-4 rounded-xl border-border/70 bg-background resize-none text-sm focus-visible:ring-primary pr-10"
                rows={1}
              />
            </div>
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="h-[48px] px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shrink-0 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <SendIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </div>
              )}
            </Button>
          </form>
          <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-muted-foreground/80">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">Shift+Enter</kbd> for new line</span>
            <span>🔒 Server-side AI API Key Secured</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
