"use client";

import { useState } from "react";

type Message = {
  role: "user" | "ai";
  text: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! I'm a watermark recommendation AI. Describe your image, and I'll recommend the perfect watermark for you!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    const aiMessage: Message = {
      role: "ai",
      text: data.reply,
    };

    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#E3F2FD] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg flex flex-col h-[80vh]">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">
            AI Watermark Recommendation
          </h1>
          <p className="text-sm text-gray-500">
            Describe your image and get the perfect watermark recommendation!
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-500 text-sm">
              AI is typing...
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            className="flex-1 border rounded-xl px-4 py-2 outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your image..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button
            onClick={sendMessage}
            className="bg-black text-white px-5 py-2 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}