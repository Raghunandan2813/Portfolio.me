import Link from "next/link";
import { ContactForm } from "./components/ContactForm";
import { GithubActivity } from "./components/GithubActivity";
import { GithubProjects } from "./components/GithubProjects";
import { ProjectMedia } from "./components/ProjectMedia";
import { VisitorCounter } from "./components/VisitorCounter";
import { projects, skillGroups } from "./data/portfolio";

const experiences = [
  {
    company: "Snorkel AI",
    monogram: "S",
    role: "AI Expert",
    date: "July 2026 - Present",
    location: "Remote",
    current: true,
    description: "Current work focused on AI quality and model evaluation for production-grade artificial intelligence systems.",
    skills: ["AI evaluation", "Model quality", "Technical reasoning"],
  },
  {
    company: "Outlier",
    monogram: "O",
    role: "AI Engineer and Trainer",
    date: "June 2026 - Present",
    location: "Remote · San Francisco, USA",
    description: "Evaluated LLM responses for quality, accuracy, and safety; trained models with structured feedback; supported annotation datasets; and tested prompts across edge cases.",
    skills: ["LLM evaluation", "Prompt testing", "Data annotation"],
  },
  {
    company: "TurboML",
    monogram: "T",
    role: "Software Engineering Intern (AI)",
    date: "April 2025 - May 2026",
    location: "Remote · California, USA",
    description: "Built a Redis-based agentic reminder system, multi-tool routing for Swiggy, Blinkit, and Google APIs, plus a runtime-configurable WhatsApp Business command layer.",
    skills: ["Agent systems", "Redis", "WhatsApp API"],
  },
];

export default function Home() {
  return (
    <main className="social-app" id="top">
      <section className="profile-card page-shell" aria-labelledby="profile-name">
        <div className="profile-banner">
          <div className="banner-grid" />
          <span className="banner-code">BUILD / LEARN / SHIP</span>
          <div className="banner-copy"><small>FULL STACK</small><strong>×</strong><small>AGENTIC AI</small></div>
        </div>
        <div className="profile-body">
          <div className="avatar-ring" aria-label="Profile photo area"><div className="profile-avatar">RK</div></div>
          <div className="profile-actions">
            <a className="icon-action" href="mailto:raghu9555k@gmail.com" aria-label="Email Raghunandan">✉</a>
            <a className="outline-action" href="https://www.linkedin.com/in/raghunandan-kumar-730747253/" target="_blank" rel="noreferrer">Connect</a>
            <a className="primary-action" href="/resume/raghunandan-kumar-resume.pdf" download>Download resume <span>↓</span></a>
          </div>
          <div className="identity-row">
            <h1 id="profile-name">Raghunandan Kumar <span className="verified" title="Resume verified">✓</span></h1>
            <p className="handle">@raghunandan.dev</p>
          </div>
          <p className="profile-headline">Full Stack &amp; Agentic AI Engineer · Building production-grade LLM pipelines, RAG systems, multi-agent workflows, and real-time products.</p>
          <p className="profile-meta">Kushinagar, India · Remote <span>·</span> <a href="mailto:raghu9555k@gmail.com">Contact info</a></p>
          <div className="profile-links">
            <a href="https://github.com/raghunandan2813" target="_blank" rel="noreferrer"><b>GH</b> github.com/raghunandan2813</a>
            <a href="https://www.linkedin.com/in/raghunandan-kumar-730747253/" target="_blank" rel="noreferrer"><b>in</b> LinkedIn</a>
            <span><i /> Open to meaningful AI &amp; full-stack roles</span>
          </div>
          <div className="profile-stats">
            <div><strong>2+</strong><span>years experience</span></div>
            <div><strong>3</strong><span>flagship products</span></div>
            <div><strong>Full stack</strong><span>AI specialization</span></div>
            <VisitorCounter />
          </div>
        </div>
      </section>

      <div className="social-layout page-shell">
        <div className="feed-column">
          <section className="feed-card about-post" id="about">
            <header className="post-author"><span className="mini-avatar">RK</span><div><strong>Raghunandan Kumar</strong><small>Full Stack &amp; Agentic AI Engineer · now</small></div><button aria-label="More information">•••</button></header>
            <div className="post-copy">
              <span className="eyebrow">About</span>
              <h2>I build AI products where the intelligence is part of the architecture—not a decorative API call.</h2>
              <p>I have hands-on experience creating production-grade LLM pipelines, persistent semantic memory, RAG systems, agent workflows, voice interfaces, browser IDEs, and the full-stack foundations that make them useful.</p>
              <p>My strongest work sits at the intersection of <b>Next.js product engineering</b>, <b>agentic AI</b>, and <b>reliable data systems</b>.</p>
            </div>
            <footer className="post-reactions"><span>✦ Product engineering</span><span>⌁ Agentic systems</span><span>↗ Shipping mindset</span></footer>
          </section>

          <section className="feed-card work-feed" id="work">
            <div className="feed-heading">
              <div><span className="eyebrow">Featured work · Bento showcase</span><h2>See what I actually built.</h2><p>Each product has a dedicated case-study page and an on-site demo-video slot.</p></div>
              <Link href="/projects">View all projects ↗</Link>
            </div>
            <div className="work-bento">
              {projects.map((project, index) => (
                <article className={`bento-project bento-${index + 1}`} key={project.slug}>
                  <ProjectMedia project={project} compact={index > 0} />
                  <div className="bento-project-copy">
                    <span>{project.category}</span>
                    <h3>{project.shortTitle}</h3>
                    <p>{project.summary}</p>
                    <div className="bento-tags">{project.stack.slice(0, index === 0 ? 5 : 3).map((item) => <i key={item}>{item}</i>)}</div>
                    <Link href={`/projects/${project.slug}`}>Open case study <b>↗</b></Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="feed-card github-feed" id="projects">
            <div className="feed-heading compact-heading">
              <div><span className="eyebrow">Projects · Synced from GitHub</span><h2>Latest public repositories</h2><p>This feed refreshes automatically as repositories change.</p></div>
              <a href="https://github.com/raghunandan2813" target="_blank" rel="noreferrer">Open GitHub ↗</a>
            </div>
            <GithubProjects />
          </section>

          <GithubActivity />

          <section className="feed-card experience-feed" id="experience">
            <div className="feed-heading compact-heading"><div><span className="eyebrow">Experience</span><h2>Where I have applied the work</h2></div></div>
            <div className="experience-list">
              {experiences.map((experience) => (
                <article key={experience.company}>
                  <div className={`company-logo ${experience.current ? "current" : ""}`}>{experience.monogram}</div>
                  <div className="experience-copy">
                    <div className="experience-title"><div><h3>{experience.role}</h3><p>{experience.company}</p></div>{experience.current && <span>Current</span>}</div>
                    <small>{experience.date} · {experience.location}</small>
                    <p>{experience.description}</p>
                    <div className="experience-skills">{experience.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="stack-system" id="stack">
            <div className="stack-intro">
              <span className="eyebrow light">Technical signal</span>
              <h2>A stack organised around outcomes.</h2>
              <p>Recruiters should not have to decode a wall of logos. Every capability below is connected to the kind of product work it supports.</p>
              <div className="stack-orbit" aria-label="Core engineering disciplines">
                <div className="orbit orbit-one"><span>RAG</span><span>Next.js</span></div>
                <div className="orbit orbit-two"><span>LangGraph</span><span>Postgres</span><span>FastAPI</span></div>
                <strong>FULL STACK<br /><b>AI</b></strong>
              </div>
            </div>
            <div className="skill-matrix">
              {skillGroups.map((group, index) => (
                <article key={group.label}>
                  <header><span>0{index + 1}</span><div><small>{group.signal}</small><h3>{group.label}</h3></div></header>
                  <div>{group.items.map((item) => <i key={item}>{item}</i>)}</div>
                  <p>{group.proof}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="feed-card testimonials-feed" id="testimonials">
            <div className="feed-heading compact-heading"><div><span className="eyebrow">Testimonials</span><h2>Verified words only.</h2><p>I will never publish a made-up recommendation.</p></div></div>
            <div className="testimonial-placeholder">
              <span className="quote-mark">“</span>
              <blockquote>Professional feedback from collaborators, managers, or clients will appear here once it is provided and approved.</blockquote>
              <div><span className="placeholder-avatar">+</span><p><strong>References available on request</strong><small>Add a real quote, name, role, company, and profile link.</small></p></div>
            </div>
          </section>

          <section className="feed-card contact-feed" id="contact">
            <div className="contact-intro"><span className="eyebrow">Contact</span><h2>Let&apos;s build something useful.</h2><p>Share the role, product, problem, or collaboration you have in mind. Your message is stored securely, and you can also reach me directly by email.</p><a href="mailto:raghu9555k@gmail.com">raghu9555k@gmail.com ↗</a></div>
            <ContactForm />
          </section>
        </div>

        <aside className="side-column">
          <section className="side-card open-card"><span className="side-icon">◎</span><h3>Open to work</h3><p>Full Stack Engineer, AI Engineer, Agentic AI, or a role combining all three.</p><a href="mailto:raghu9555k@gmail.com">Start a conversation</a></section>
          <section className="side-card"><h3>Current</h3><div className="side-role"><span>S</span><p><strong>AI Expert</strong><small>Snorkel AI · Since July 2026</small></p></div><div className="side-role"><span>O</span><p><strong>AI Engineer &amp; Trainer</strong><small>Outlier · Remote</small></p></div></section>
          <section className="side-card"><h3>Education</h3><div className="education-mark">GGV</div><strong>B.Tech, Information Technology</strong><p>Guru Ghasidas Vishwavidyalaya<br />2022 - 2026 · Bilaspur</p></section>
          <section className="side-card resume-card"><span>PDF · 1 page</span><h3>Recruiter-ready resume</h3><p>Experience, technical stack, product highlights, and education in one download.</p><a href="/resume/raghunandan-kumar-resume.pdf" download>Download resume ↓</a></section>
          <section className="side-card ask-card"><span>✦</span><h3>Short on time?</h3><p>Use the resume chatbot in the corner and ask about skills, projects, or experience.</p></section>
        </aside>
      </div>

      <footer className="social-footer page-shell"><div><span className="nav-brand"><b>RK</b></span><p><strong>Raghunandan Kumar</strong><small>Full Stack &amp; Agentic AI Engineer</small></p></div><nav><a href="#about">About</a><Link href="/projects">Projects</Link><a href="#experience">Experience</a><a href="#contact">Contact</a></nav><p>© 2026 · Designed and developed by Raghunandan Kumar</p></footer>
    </main>
  );
}
