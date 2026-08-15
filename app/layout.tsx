import type { Metadata } from "next";
import "./globals.css";
import { ResumeChat } from "./components/ResumeChat";
import { SiteNav } from "./components/SiteNav";

export const metadata: Metadata = {
  title: "Raghunandan Kumar | Full Stack & Agentic AI Engineer",
  description: "Raghunandan Kumar is a Full Stack and Agentic AI Engineer building production-grade LLM pipelines, RAG systems, multi-agent workflows, and real-time products.",
  keywords: ["Raghunandan Kumar", "Full-stack Developer", "AI Engineer", "Next.js Developer", "LangGraph", "RAG", "India"],
  openGraph: {
    title: "Raghunandan Kumar | Full-stack + AI Engineer",
    description: "Full Stack and Agentic AI Engineer building production-grade AI products.",
    type: "website",
  },
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Raghunandan Kumar",
  jobTitle: "Full Stack and Agentic AI Engineer",
  url: "https://github.com/Raghunandan2813",
  sameAs: [
    "https://github.com/Raghunandan2813",
    "https://in.linkedin.com/in/raghunandan-kumar-730747253",
  ],
  knowsAbout: ["Next.js", "TypeScript", "Python", "FastAPI", "RAG", "LangGraph", "MCP"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
        <ResumeChat />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      </body>
    </html>
  );
}
