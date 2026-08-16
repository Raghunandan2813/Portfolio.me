/**
 * One engineering decision, split into what was built and why it matters.
 * `use` is optional so a project can ship the mechanism first and gain the
 * rationale later, rather than blocking on both.
 */
export type Highlight = {
  title: string;
  mechanism: string;
  use?: string;
};

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  tagline: string;
  summary: string;
  problem: string;
  solution: string;
  highlights: Highlight[];
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
  /** Human-readable runtime, shown on the video cover. */
  demoLength?: string;
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
      "Mindly AI solves context loss in LLM chat. A background extraction pipeline distils each turn into typed entity nodes and labelled relationship edges, embedded at 384 dimensions and stored in Postgres with pgvector. Retrieval runs three paths in parallel - cosine similarity over nodes with one-hop graph traversal, vector search across session summaries, and full-text search aggregated by session-then merges them into a bounded system prompt.",
    problem:
      "Normal AI chatbots forget everything .Every new chat starts empty. Last week you told it about your dog. Today it does not know your dog. You explain the same things again and again. This wastes time.There is a second problem. Sometimes you remember, I talked about this before. But you cannot find that old chat. You scroll up and down. You still do not find it.So the AI forgets, and you also cannot search properly.",
    solution:
      "Mindly uses a dual-channel memory engine: pgvector retrieves semantically related context while PostgreSQL knowledge graphs retain relationships across conversations. A provider abstraction layer keeps generation available across Groq, Gemini, OpenRouter, and Ollama.",
    highlights: [
      {
        title: "Session-scoped provenance in the knowledge graph",
        mechanism:
          "Each extracted fact is stored as a typed node with a session_id for where it was first learned, plus a metadata.sessions array of every conversation it recurred in.",
        use:
          "The system answers where and when a fact entered memory, not only what it knows. Provenance queries resolve to a conversation, a date, and a match count.",
      },
      {
        title: "Hybrid retrieval under a fixed prompt budget",
        mechanism:
          "Three concurrent paths: ANN cosine similarity over node embeddings with one-hop edge traversal, GIN-indexed tsvector search aggregated per session, and vector search over generated session summaries. Results merge into a character budget partitioned across memory, cross-session logs, and in-session history.",
        use:
          "Vector search handles paraphrase but degrades on rare literal tokens — identifiers, error codes, proper nouns. Full-text handles exactly those and misses semantics. Running both covers the failure mode of each, and the budget keeps token cost bounded regardless of history size.",
      },
      {
        title: "Pluggable provider layer with a fully offline path",
        mechanism:
          "One interface over Groq, Gemini, OpenRouter, and Ollama, with server-side model resolution that ignores client-supplied model names.",
        use:
          "The deployment target is a config value. The Ollama path runs the whole system on local hardware with no outbound inference calls.",
      },
      {
        title: "Multi-tenant isolation and data-rights compliance",
        mechanism:
          "Row-level security on every table, API routes deriving identity from the authenticated session rather than the request body, AES-256-GCM for stored OAuth tokens, Redis-backed session revocation and rate limiting that fail closed, and scheduled retention purges.",
        use:
          "One user's memory is unreachable from another's account, revoked sessions die immediately, and users can export or delete everything they own.",
      },
    ],
    stack: ["Next.js 15", "React 19", "Groq", "pgvector", "Supabase", "Redis", "OAuth 2.0"],
    liveUrl: "https://mindly-ai-agent.vercel.app/",
    githubUrl: "https://github.com/Raghunandan2813/Mindly-Ai-Agent",
    demoVideo: "/videos/mindly-ai-demo.mp4",
    demoPoster: null,
    demoLength: "5:50",
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
      {
        title: "Low-latency voice interviews over WebSocket",
        mechanism:
          "Low-latency Vapi WebSocket voice interviews with live transcripts.",
      },
      {
        title: "Client-side confidence and focus signals",
        mechanism:
          "Client-side Face-API.js signals for confidence and focus analysis.",
      },
      {
        title: "Schema-validated evaluation pipeline",
        mechanism:
          "Groq and Zod evaluation pipeline for schema-validated feedback.",
      },
      {
        title: "Authenticated history, scoring and progress",
        mechanism:
          "Firebase authentication, interview history, scoring, and progress tracking.",
      },
    ],
    stack: ["Next.js 16", "TypeScript", "Vapi", "Groq", "Firebase", "Face-API.js", "Zod"],
    liveUrl: "https://interview-with-ai-alpha.vercel.app/sign-in",
    githubUrl: "https://github.com/raghunandan2813/ai-interview-coach",
    demoVideo: "/videos/ai-interview-coach-demo.mp4",
    demoPoster: null,
    demoLength: "7:35",
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
      {
        title: "Browser-native Node.js runtime",
        mechanism:
          "Live Node.js runtimes in the browser through WebContainer API.",
      },
      {
        title: "Ghost-text autocomplete in the editor",
        mechanism:
          "Custom CodeMirror 6 extensions for ghost-text AI autocomplete.",
      },
      {
        title: "Context-aware inline refactoring",
        mechanism:
          "Context-aware Cmd+K refactoring powered by Claude Sonnet.",
      },
      {
        title: "Collaborative application state",
        mechanism: "Convex-backed collaborative application state.",
      },
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
