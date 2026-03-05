import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Expense, Saving, Settings } from "../types";
import { Send, Sparkles, User, Bot } from "lucide-react";
import Markdown from "react-markdown";

interface AIChatProps {
  expenses: Expense[];
  savings: Saving[];
  settings: Settings;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat({ expenses, savings, settings }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Zdravo! Ja sam tvoj AI asistent za troškove. Kako ti mogu pomoći danas? Mogu analizirati tvoju potrošnju, dati savjete za uštedu ili odgovoriti na pitanja o tvojim podacima.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const systemInstruction = `Ti si stručnjak za osobne financije. Analiziraj troškove korisnika i odgovaraj na pitanja.
      Korisnik trenutno ima sljedeće podatke:
      - Plata/Prihod: ${settings.salary} ${settings.currency}
      - Troškovi: ${JSON.stringify(expenses, null, 2)}
      - Štednja: ${JSON.stringify(savings, null, 2)}
      
      Odgovaraj na hrvatskom jeziku. Budi koristan, profesionalan i pruži konkretne savjete temeljene na podacima.
      Ako korisnik pita za ukupni iznos, izračunaj ga. Ako pita za kategorije, navedi ih.
      Daj savjete kako uštedjeti novac na temelju najviših troškova i trenutnog stanja (plus/minus).`;

      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction,
        },
      });

      const aiResponse = response.text || "Nažalost, ne mogu odgovoriti u ovom trenutku.";
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Došlo je do greške prilikom komunikacije s AI modelom. Provjeri API ključ." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card h-[600px] flex flex-col">
      <div className="p-4 border-b border-zinc-200 flex items-center gap-2 bg-zinc-50">
        <Sparkles size={20} className="text-purple-500" />
        <h3 className="font-semibold text-zinc-900">AI Analiza Troškova</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-zinc-900 text-white" : "bg-purple-100 text-purple-600"
              }`}
            >
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl p-4 text-sm ${
                msg.role === "user"
                  ? "bg-zinc-900 text-white rounded-tr-none"
                  : "bg-zinc-100 text-zinc-800 rounded-tl-none"
              }`}
            >
              <div className="markdown-body prose prose-sm max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center animate-pulse">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-100 rounded-2xl p-4 rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pitaj AI o svojim troškovima..."
          className="input-field flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary flex items-center justify-center p-2 rounded-xl aspect-square"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
