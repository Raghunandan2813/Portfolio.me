export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  tagline: string;
  summary: string;
  problem: string;
  solution: string;
  highlights: string[];
  stack: string[];
  liveUrl: string;
  githubUrl: string;
  /** Path under /public, e.g. "/videos/mindly-demo.mp4". null hides the player. */
  demoVideo: string | null;
  /**
   * Still frame shown before playback. Without it the player is a black
   * rectangle until the first frame decodes, so always ship one alongside
   * the video.
   */
  demoPoster?: string | null;
  accent: "violet" | "blue" | "orange";
};

export const projects: Project[] = [
  {
    slug: "mindly-ai",
    title: "Mindly AI - Persistent Memory Agent",
    shortTitle: "Mindly AI",
    category: "Agentic AI / SaaS",
    tagline: "An AI agent that remembers the context that matters.",
    summary:
      "A memory-first AI workspace combining semantic recall, knowledge graphs, provider failover, and background relationship extraction for durable conversations.",
    problem:
      "Most AI chats forget important context between sessions and become unreliable when a single model provider is unavailable.",
    solution:
      "Mindly uses a dual-channel memory engine: pgvector retrieves semantically related context while PostgreSQL knowledge graphs retain relationships across conversations. A provider abstraction layer keeps generation available across Groq, Gemini, OpenRouter, and Ollama.",
    highlights: [
      "Dual-channel memory using pgvector semantic search and PostgreSQL knowledge graphs",
      "Four-stage embedding and model-provider failover for resilient serverless execution",
      "Background relationship extraction that keeps the main conversation responsive",
      "OAuth 2.0 authentication with Supabase and Redis-backed application workflows",
    ],
    stack: ["Next.js 15", "React 19", "Groq", "pgvector", "Supabase", "Redis", "OAuth 2.0"],
    liveUrl: "https://mindly-ai-agent.vercel.app/",
    githubUrl: "https://github.com/Raghunandan2813/Mindly-Ai-Agent",
    demoVideo: "/videos/mindly-ai-demo.mp4",
    demoPoster: null,
    accent: "violet",
  },
  {
    slug: "ai-interview-coach",
    title: "AI Interview Coach",
    shortTitle: "Interview Coach",
    category: "Voice AI / SaaS",
    tagline: "Real-time interview practice with voice, vision, and structured feedback.",
    summary:
      "A full interview simulation product with low-latency voice conversations, live transcription, face-based confidence signals, and schema-validated AI feedback.",
    problem:
      "Candidates need realistic, repeatable interview practice but human mock interviews are difficult to schedule and feedback is often inconsistent.",
    solution:
      "The platform combines Vapi voice sessions, role-specific interview generation, live transcription, client-side face tracking, and a Groq evaluation pipeline that returns consistent structured feedback.",
    highlights: [
      "Low-latency Vapi WebSocket voice interviews with live transcripts",
      "Client-side Face-API.js signals for confidence and focus analysis",
      "Groq and Zod evaluation pipeline for schema-validated feedback",
      "Firebase authentication, interview history, scoring, and progress tracking",
    ],
    stack: ["Next.js 16", "TypeScript", "Vapi", "Groq", "Firebase", "Face-API.js", "Zod"],
    liveUrl: "https://interview-with-ai-alpha.vercel.app/sign-in",
    githubUrl: "https://github.com/raghunandan2813/ai-interview-coach",
    demoVideo: null,
    accent: "blue",
  },
  {
    slug: "cognito",
    title: "Cognito - AI-Powered Browser IDE",
    shortTitle: "Cognito IDE",
    category: "Developer Tool / AI",
    tagline: "A full-stack coding workspace that runs entirely in the browser.",
    summary:
      "A browser IDE with live Node.js runtimes, terminal access, AI autocomplete, and context-aware refactoring without server provisioning.",
    problem:
      "Cloud development environments often depend on expensive server infrastructure and separate tools for runtime, terminal, editing, and AI assistance.",
    solution:
      "Cognito uses WebContainer API to run Node.js client-side, CodeMirror 6 for the editor, xterm.js for terminal access, and Claude for ghost-text completion and Cmd+K refactoring.",
    highlights: [
      "Live Node.js runtimes in the browser through WebContainer API",
      "Custom CodeMirror 6 extensions for ghost-text AI autocomplete",
      "Context-aware Cmd+K refactoring powered by Claude Sonnet",
      "Convex-backed collaborative application state",
    ],
    stack: ["Next.js", "WebContainer API", "Claude Sonnet", "TypeScript", "CodeMirror 6", "xterm.js", "Convex"],
    liveUrl: "https://cognito.ai/",
    githubUrl: "https://github.com/raghunandan2813/cognito",
    demoVideo: null,
    accent: "orange",
  },
];

export const skillGroups = [
  {
    label: "Interface systems",
    signal: "Product UI",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "CodeMirror 6", "HTML5 Canvas"],
    proof: "Used across Mindly, Interview Coach, and Cognito",
  },
  {
    label: "Backend & realtime",
    signal: "Production APIs",
    items: ["Node.js", "Express.js", "FastAPI", "Django", "WebSocket", "REST APIs"],
    proof: "Voice sessions, agents, scheduled workflows, and platform APIs",
  },
  {
    label: "Agentic AI",
    signal: "Core specialty",
    items: ["LangGraph", "LangChain", "RAG", "Prompt Engineering", "LLM APIs", "Firecrawl", "Inngest"],
    proof: "Memory agents, multi-tool routing, evaluation, and retrieval",
  },
  {
    label: "Data & memory",
    signal: "State layer",
    items: ["PostgreSQL", "pgvector", "Supabase", "MongoDB", "Redis", "Convex", "SQL"],
    proof: "Semantic memory, knowledge graphs, realtime state, and queues",
  },
  {
    label: "Cloud & reliability",
    signal: "Ship & observe",
    items: ["Docker", "AWS", "Azure", "GCP", "Clerk", "Sentry", "Git", "Jira"],
    proof: "Authentication, deployment, storage, monitoring, and teamwork",
  },
];

export const resumeFacts = [
  {
    id: "summary",
    keywords: ["who", "about", "summary", "profile", "engineer", "introduce", "yourself"],
    answer:
      "Raghunandan Kumar is a Full Stack and Agentic AI Engineer who builds production-grade LLM pipelines, RAG systems, multi-agent workflows, and real-time web products. His core stack includes Next.js, TypeScript, Node.js, Python, PostgreSQL, LangGraph, and LangChain.",
  },
  {
    id: "snorkel",
    keywords: ["current", "snorkel", "job", "role", "work", "company", "experience"],
    answer:
      "Raghunandan currently works as an AI Expert at Snorkel AI, starting in July 2026, with a focus on AI quality and model evaluation.",
  },
  {
    id: "outlier",
    keywords: ["outlier", "trainer", "evaluation", "annotation", "prompt", "safety"],
    answer:
      "At Outlier, Raghunandan worked as an AI Engineer and Trainer, evaluating LLM outputs for quality, accuracy, and safety; providing structured feedback; supporting annotation; and testing model behavior with prompts and edge cases.",
  },
  {
    id: "turboml",
    keywords: ["turbo", "turboml", "intern", "whatsapp", "swiggy", "blinkit", "reminder", "redis"],
    answer:
      "During his AI Software Engineering internship at TurboML from April 2025 to May 2026, Raghunandan built a Redis-based agentic reminder system, multi-tool integrations for Swiggy, Blinkit, and Google APIs, and a WhatsApp Business API command layer.",
  },
  {
    id: "projects",
    keywords: ["project", "projects", "built", "portfolio", "saas", "product"],
    answer:
      "His featured products are Mindly AI, a persistent-memory agent; AI Interview Coach, a voice and vision interview simulator; and Cognito, an AI-powered browser IDE using WebContainer and CodeMirror.",
  },
  {
    id: "skills",
    keywords: ["skill", "skills", "stack", "technology", "technologies", "language", "frontend", "backend", "ai", "database"],
    answer:
      "Raghunandan works with TypeScript, JavaScript, Python, C++, SQL, Go, Next.js, React, Node.js, FastAPI, Django, LangGraph, LangChain, RAG, PostgreSQL, Supabase, MongoDB, Redis, Convex, Docker, AWS, Azure, and GCP.",
  },
  {
    id: "education",
    keywords: ["education", "college", "degree", "university", "graduate", "btech"],
    answer:
      "Raghunandan completed a B.Tech in Information Technology at Guru Ghasidas Vishwavidyalaya, Bilaspur, from December 2022 to April 2026.",
  },
  {
    id: "contact",
    keywords: ["contact", "email", "hire", "reach", "available", "resume", "cv"],
    answer:
      "You can contact Raghunandan at raghu9555k@gmail.com, use the contact form on this portfolio, connect on LinkedIn, or download his resume from the profile section.",
  },
];
