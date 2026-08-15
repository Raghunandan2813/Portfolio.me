"use client";

import { FormEvent, useState } from "react";

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [feedback, setFeedback] = useState("Your message will be sent securely to my inbox.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");
    setFeedback("Sending your message…");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to send your message.");

      setStatus("success");
      setFeedback("Message received. I’ll get back to you as soon as possible.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Unable to send your message.");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Name
          <input type="text" name="name" placeholder="Your name" minLength={2} maxLength={100} required />
        </label>
        <label>
          Email
          <input type="email" name="email" placeholder="you@company.com" maxLength={160} required />
        </label>
      </div>
      <label>
        What can I help with?
        <select name="type" defaultValue="" required>
          <option value="" disabled>Select a topic</option>
          <option>Full-time opportunity</option>
          <option>Freelance project</option>
          <option>AI product consultation</option>
          <option>Collaboration</option>
          <option>Something else</option>
        </select>
      </label>
      <label>
        Message
        <textarea name="message" rows={5} placeholder="A little context about your goal, timeline, and what you need..." minLength={20} maxLength={3000} required />
      </label>
      <label className="honeypot" aria-hidden="true">
        Company website
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button button-primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"} <span aria-hidden="true">↗</span>
      </button>
      <p className={`form-note ${status}`} aria-live="polite">{feedback}</p>
    </form>
  );
}
