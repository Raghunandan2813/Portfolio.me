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
  /** null when there is no public deployment; the CTA is hidden. */
  liveUrl: string | null;
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
    // TODO: no reachable deployment (cognito.ai does not resolve). Set the
    // real URL here and the 'Open live product' button returns automatically.
    liveUrl: null,
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

/**
 * Answers for the resume chatbot, kept in step with public/resume.
 *
 * Deliberately hand-written rather than extracted from the PDF at runtime: the
 * chat claims to be "grounded in resume", and that claim is only honest if a
 * human has checked every sentence it can say.
 */
export const resumeFacts = [
  {
    id: "summary",
    keywords: ["who", "about", "summary", "profile", "engineer", "introduce", "yourself"],
    answer:
      "Raghunandan Kumar is a Full Stack and Agentic AI Engineer with 2+ years of hands-on experience building AI-powered and full-stack applications — LLM pipelines, RAG systems, AI agents, semantic memory, and real-time products. He takes AI products from backend architecture and API integration through to production user interfaces.",
  },
  {
    id: "snorkel",
    keywords: ["current", "snorkel", "job", "role", "work", "company", "experience", "now"],
    answer:
      "Since July 2026 he has been an AI Expert at Snorkel AI (contract, remote). He rebuilt 7+ returned tasks from real merged open-source PRs across Python, TypeScript and Rust, and hardened the grading itself: agents could score a perfect 1.0 by printing graded test IDs without running a test, which he fixed with per-run secret tokens injected into test names at verify time.",
  },
  {
    id: "snorkel-audit",
    keywords: ["oracle", "forgery", "idempotence", "grading", "audit", "forensics", "review", "integrity"],
    answer:
      "At Snorkel AI he runs oracle, base, forgery and idempotence scenarios straight from the packed submission zip to reproduce the real grading environment, catching defects the automated gates scored as passing. One oracle solution was missing 13 of the PR's own test files while still reporting 1.0. He also reviews other contributors' work, once using git forensics — loose objects, missing remote, commit metadata — to show a shipped repo was a fresh git init with a fabricated base commit SHA.",
  },
  {
    id: "outlier",
    keywords: ["outlier", "trainer", "evaluation", "annotation", "prompt", "safety", "rlhf", "feedback"],
    answer:
      "Since June 2026 he has also worked as an AI Engineer and Trainer at Outlier (freelance, remote). He evaluates LLM responses for accuracy, reasoning quality, instruction following, relevance and safety; trains models through structured feedback and comparative evaluation; designs prompts that surface edge cases and failure patterns; and handles annotation and validation for training datasets.",
  },
  {
    id: "internship",
    keywords: ["tubo", "mi", "intern", "internship", "whatsapp", "swiggy", "blinkit", "reminder", "redis", "daemon", "first"],
    answer:
      "From April 2025 to May 2026 he was a Software Engineering Intern (AI) at Tubo MI, remote. He engineered a Redis-backed scheduling engine using Sorted Sets and a purpose-built daemon for sub-second reminder execution within a 24-hour window, unified Swiggy, Blinkit and Google APIs behind an AI-agent tool layer with contextual tool selection, and built a WhatsApp Business bot control interface with /help, /reset and /new commands plus Azure Blob Storage file handling.",
  },
  {
    id: "projects",
    keywords: ["project", "projects", "built", "build", "portfolio", "product", "products", "case"],
    answer:
      "Three flagship products: Mindly AI, a persistent-memory agent; AI Interview Coach, a voice-and-vision interview simulator; and Cognito, an AI-powered browser IDE. Each has a full case study on this site with the problem, architecture and source code.",
  },
  {
    id: "mindly",
    keywords: ["mindly", "memory", "pgvector", "embedding", "graph", "groq", "semantic"],
    answer:
      "Mindly AI is a persistent-memory agent built on Next.js 15, React 19, Groq, pgvector, Supabase and Redis. It uses a dual-channel memory system — pgvector semantic search alongside PostgreSQL knowledge graphs — and a four-stage embedding pipeline that fails over automatically across Groq, Gemini, OpenRouter and Ollama. Relationship extraction runs in the background so context stays current without adding user-facing latency.",
  },
  {
    id: "interview",
    keywords: ["interview", "coach", "voice", "vapi", "face", "transcription", "firebase"],
    answer:
      "AI Interview Coach runs low-latency AI voice interviews using the Vapi WebSocket SDK with Next.js 16, with live transcription and a client-side Face-API.js pipeline capturing confidence and focus signals. Feedback comes from an automated evaluation pipeline using Groq (Llama 3.3), the Vercel AI SDK and Zod for schema-validated output, with Firebase tying the workflow together.",
  },
  {
    id: "cognito",
    keywords: ["cognito", "ide", "browser", "webcontainer", "codemirror", "editor", "terminal", "autocomplete", "refactor", "convex"],
    answer:
      "Cognito is a browser-based full-stack IDE using the WebContainer API and xterm.js to run complete Node.js environments client-side with zero server provisioning. Custom CodeMirror 6 extensions provide real-time ghost-text autocomplete and context-aware Cmd+K refactoring via Claude Sonnet 4.6, with Convex handling real-time persistence across sessions.",
  },
  {
    id: "skills",
    keywords: ["skill", "skills", "stack", "technology", "technologies", "language", "languages", "frontend", "backend", "database", "tools"],
    answer:
      "Languages: TypeScript, JavaScript, Python, C++, SQL and Golang. Frontend: Next.js, React, Tailwind CSS, CodeMirror 6 and HTML5 Canvas. Backend: Node.js, Express, FastAPI, Django, WebSocket, REST and the WhatsApp Business API. Agentic AI: LangChain, LangGraph, RAG pipelines, prompt engineering, Firecrawl and Inngest. Data: PostgreSQL, Supabase with pgvector, MongoDB, Redis and Convex. Tools: Git, Docker, Azure, AWS, GCP, Clerk and Sentry.",
  },
  {
    id: "education",
    keywords: ["education", "college", "degree", "university", "graduate", "btech", "study"],
    answer:
      "He is completing a B.Tech in Information Technology at Guru Ghasidas Vishwavidyalaya in Bilaspur, from December 2022 to April 2026.",
  },
  {
    id: "contact",
    keywords: ["contact", "email", "hire", "hiring", "reach", "available", "resume", "cv", "download"],
    answer:
      "Reach him at raghu9555k@gmail.com, use the contact form on this site, or connect on LinkedIn. The full resume is downloadable from the profile section at the top of the page.",
  },
];
