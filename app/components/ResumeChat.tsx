"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { resumeFacts } from "../data/portfolio";

type Message = { role: "assistant" | "user"; text: string };

const starters = ["What has he built?", "What is his AI stack?", "What does he do at Snorkel AI?"];

function tokenize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+#.]+/g, " ").split(/\s+/).filter((word) => word.length > 1);
}

function answerQuestion(question: string) {
  const words = new Set(tokenize(question));
  const asked = question.toLowerCase();
  const ranked = resumeFacts
    .map((fact) => {
      const score = fact.keywords.reduce(
        (total, keyword) => total + (words.has(keyword) ? 3 : asked.includes(keyword) ? 1 : 0),
        0,
      );
      /*
       * Length of the longest keyword that actually matched, used only to
       * break ties. "Tell me about Mindly AI" matches `about` on the general
       * summary and `mindly` on the project, both worth 3 — and the broad
       * answer won purely by sitting earlier in the array. Preferring the
       * more specific word is what makes a product name beat a connective.
       */
      const longest = fact.keywords.reduce(
        (best, keyword) =>
          (words.has(keyword) || asked.includes(keyword)) && keyword.length > best
            ? keyword.length
            : best,
        0,
      );
      return { fact, score, longest };
    })
    .sort((a, b) => b.score - a.score || b.longest - a.longest);

  if (!ranked[0] || ranked[0].score === 0) {
    return "I can answer from Raghunandan's resume about his experience, projects, skills, education, current role, or how to contact him. Try asking: “Tell me about Mindly AI” or “What is his backend stack?”";
  }
  return ranked[0].fact.answer;
}

export function ResumeChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I know Raghunandan's resume. Ask me about his experience, projects, or technical stack." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggested = useMemo(() => (messages.length < 4 ? starters : []), [messages.length]);

  function ask(question: string) {
    const clean = question.trim();
    if (!clean) return;
    setMessages((current) => [...current, { role: "user", text: clean }, { role: "assistant", text: answerQuestion(clean) }]);
    setInput("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div className={`resume-chat ${open ? "open" : ""}`}>
      {open && (
        <section className="chat-panel" aria-label="Ask about Raghunandan's resume">
          <header>
            <span className="chat-avatar">RK</span>
            <div><strong>Ask Raghunandan AI</strong><small><i /> Grounded in resume</small></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close resume chatbot">×</button>
          </header>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => <p className={message.role} key={`${message.role}-${index}`}>{message.text}</p>)}
          </div>
          {suggested.length > 0 && <div className="chat-suggestions">{suggested.map((item) => <button type="button" onClick={() => ask(item)} key={item}>{item}</button>)}</div>}
          <form onSubmit={submit}>
            <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about skills, work, projects…" maxLength={220} aria-label="Question about Raghunandan" />
            <button type="submit" aria-label="Send question">↑</button>
          </form>
          <small className="chat-footnote">Answers only from verified portfolio and resume information.</small>
        </section>
      )}
      <button className="chat-launcher" type="button" onClick={() => { setOpen((value) => !value); setTimeout(() => inputRef.current?.focus(), 80); }} aria-expanded={open}>
        <span>✦</span><b>{open ? "Close" : "Ask my resume"}</b>
      </button>
    </div>
  );
}
