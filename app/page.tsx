import Image from "next/image";
import Link from "next/link";
import { BannerScene } from "./components/BannerScene";
import { Carousel } from "./components/Carousel";
import { ContactForm } from "./components/ContactForm";
import { ExperienceTabs } from "./components/ExperienceTabs";
import { GithubActivity } from "./components/GithubActivity";
import { GithubProjects } from "./components/GithubProjects";
import {
  DownloadIcon,
  GithubIcon,
  LinkedInIcon,
  MailIcon,
} from "./components/Icons";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProjectMedia } from "./components/ProjectMedia";
import { Reveal, RevealGroup, RevealItem } from "./components/Reveal";
import { VisitorCounter } from "./components/VisitorCounter";
import { skillGroups } from "./data/portfolio";
import { listExperiences } from "@/lib/experiences";
import { listProjects } from "@/lib/projects";
import { listTestimonials } from "@/lib/testimonials";
import { CONTACT_EMAIL, GITHUB_PROFILE_URL, LINKEDIN_URL } from "@/lib/site";

const RESUME_PATH = "/resume/raghunandan-kumar-resume.pdf";

export default async function Home() {
  const [experiences, projects, testimonials] = await Promise.all([
    listExperiences(),
    listProjects(),
    listTestimonials(),
  ]);
  return (
    <main className="social-app" id="top">
      <Reveal as="section" className="profile-card page-shell" from="scale" amount={0.05}>
        <div className="profile-banner">
          <BannerScene />
          <div className="banner-grid" />
          <span className="banner-code"></span>
          <div className="banner-copy"><small></small><strong></strong><small></small></div>
        </div>
        <div className="profile-body">
          <div className="avatar-ring" aria-label="Profile photo">
            <ProfileAvatar className="profile-avatar" size={174} priority />
          </div>
          <div className="profile-actions">
            <a className="icon-link" href={`mailto:${CONTACT_EMAIL}`} aria-label="Email Raghunandan" title="Email">
              <MailIcon />
            </a>
            <a className="icon-link" href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
              <LinkedInIcon />
            </a>
            <a className="icon-link" href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub">
              <GithubIcon />
            </a>
            <a className="icon-link is-primary" href={RESUME_PATH} download aria-label="Download resume (PDF)" title="Download resume">
              <DownloadIcon />
            </a>
          </div>
          <div className="identity-row">
            <h1 id="profile-name">Raghunandan Kumar <span className="verified" title="Resume verified">✓</span></h1>
            <p className="handle">@raghunandan.dev</p>
          </div>
          <p className="profile-headline">Full Stack &amp; Agentic AI Engineer · Building production-grade LLM pipelines, RAG systems, multi-agent workflows, and real-time products.</p>
          <p className="profile-meta"> India  <span>·</span> <a href={`mailto:${CONTACT_EMAIL}`}>Contact info</a></p>
          
          <div className="profile-stats">
            <div><strong>2+</strong><span>years experience</span></div>
            <div><strong>3</strong><span>flagship products</span></div>
            <div><strong>Full stack</strong><span>AI specialization</span></div>
            <VisitorCounter />
          </div>
        </div>
      </Reveal>

      <div className="social-layout page-shell">
        <div className="feed-column">
          <Reveal as="section" className="feed-card about-post" id="about">
            <header className="post-author">
              <ProfileAvatar className="mini-avatar" size={42} />
              <div><strong>Raghunandan Kumar</strong><small>Full Stack &amp; Agentic AI Engineer · now</small></div>
              <button aria-label="More information">•••</button>
            </header>
            <div className="post-copy">
              <span className="eyebrow">About</span>
              <h2>I build AI products where the intelligence is part of the architecture—not a decorative API call.</h2>
              <p>I have hands-on experience creating production-grade LLM pipelines, persistent semantic memory, RAG systems, agent workflows, voice interfaces, browser IDEs, and the full-stack foundations that make them useful.</p>
              <p>My strongest work sits at the intersection of <b>Next.js product engineering</b>, <b>agentic AI</b>, and <b>reliable data systems</b>.</p>
            </div>
            <footer className="post-reactions"><span>✦ Product engineering</span><span>⌁ Agentic systems</span><span>↗ Shipping mindset</span></footer>
          </Reveal>

          <Reveal as="section" className="feed-card work-feed" id="work">
            <div className="feed-heading">
              <div><span className="eyebrow">Featured work · Bento showcase</span><h2>See what I actually built.</h2><p>Each product has a dedicated case-study page and an on-site demo-video slot.</p></div>
              <Link href="/projects">View all projects ↗</Link>
            </div>
            {/* The bento grid is a three-slot layout: .bento-1 spans wide with
                .bento-2/.bento-3 beside it. Anything past the third has no
                slot, so the overflow goes into a carousel rather than
                rendering unstyled. */}
            <RevealGroup className="work-bento" stagger={0.1}>
              {projects.slice(0, 3).map((project, index) => (
                <RevealItem className={`bento-project bento-${index + 1}`} key={project.slug} from={index % 2 === 0 ? "left" : "right"}>
                  <ProjectMedia project={project} compact={index > 0} />
                  <div className="bento-project-copy">
                    <span>{project.category}</span>
                    <h3>{project.shortTitle}</h3>
                    <p>{project.summary}</p>
                    <div className="bento-tags">{project.stack.slice(0, index === 0 ? 5 : 3).map((item) => <i key={item}>{item}</i>)}</div>
                    <Link href={`/projects/${project.slug}`}>Open case study <b>↗</b></Link>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            {projects.length > 3 && (
              <div className="work-overflow">
                <span className="eyebrow">More work</span>
                <Carousel label="More projects" autoPlay={7000}>
                  {projects.slice(3).map((project) => (
                    <div className="bento-project bento-carousel" key={project.slug}>
                      <ProjectMedia project={project} compact />
                      <div className="bento-project-copy">
                        <span>{project.category}</span>
                        <h3>{project.shortTitle}</h3>
                        <p>{project.summary}</p>
                        <div className="bento-tags">{project.stack.slice(0, 3).map((item) => <i key={item}>{item}</i>)}</div>
                        <Link href={`/projects/${project.slug}`}>Open case study <b>↗</b></Link>
                      </div>
                    </div>
                  ))}
                </Carousel>
              </div>
            )}
          </Reveal>

          <Reveal as="section" className="feed-card github-feed" id="projects">
            <div className="feed-heading compact-heading">
              <div><span className="eyebrow">Projects · Synced from GitHub</span><h2>Latest public repositories</h2><p>This feed refreshes automatically as repositories change.</p></div>
              <a href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer">Open GitHub ↗</a>
            </div>
            <GithubProjects />
          </Reveal>

          <Reveal from="scale">
            <GithubActivity />
          </Reveal>

          <Reveal as="section" className="feed-card experience-feed" id="experience">
            <div className="feed-heading compact-heading"><div><span className="eyebrow">Experience</span><h2>Where I have applied the work</h2></div></div>
            <ExperienceTabs experiences={experiences} />
          </Reveal>

          <Reveal as="section" className="stack-system" from="scale" id="stack">
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
          </Reveal>

          <Reveal as="section" className="feed-card testimonials-feed" id="testimonials">
            <div className="feed-heading compact-heading"><div><span className="eyebrow">Testimonials</span><h2>Verified words only.</h2><p>I will never publish a made-up recommendation.</p></div></div>
            {testimonials.length === 0 ? (
              <div className="testimonial-placeholder">
                <span className="quote-mark">“</span>
                <blockquote>Professional feedback from collaborators, managers, or clients will appear here once it is provided and approved.</blockquote>
                <div><span className="placeholder-avatar">+</span><p><strong>References available on request</strong><small>Add a real quote, name, role, company, and profile link.</small></p></div>
              </div>
            ) : (
              // One testimonial needs no carousel; the component hides its own
              // controls for a single slide, so this stays a plain card.
              <Carousel label="Testimonials" autoPlay={9000}>
                {testimonials.map((testimonial) => (
                  <article className="testimonial-card" key={testimonial.id}>
                    <span className="quote-mark">“</span>
                    {testimonial.rating > 0 && (
                      <div className="testimonial-stars" aria-label={`${testimonial.rating} out of 5`}>
                        {/* aria-hidden on the glyphs so a screen reader reads the
                            label once instead of "star star star star star". */}
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= testimonial.rating ? "is-on" : ""} aria-hidden="true">★</span>
                        ))}
                      </div>
                    )}
                    <blockquote>{testimonial.quote}</blockquote>
                    <div className="testimonial-by">
                      <span className="testimonial-avatar">
                        {testimonial.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={testimonial.photo} alt={testimonial.name} loading="lazy" />
                        ) : (
                          testimonial.initials
                        )}
                      </span>
                      <p>
                        <strong>
                          {testimonial.linkedin ? (
                            <a className="company-link" href={testimonial.linkedin} target="_blank" rel="noreferrer">
                              {testimonial.name} <span aria-hidden="true">↗</span>
                            </a>
                          ) : (
                            testimonial.name
                          )}
                        </strong>
                        {(testimonial.title || testimonial.company) && (
                          <small>{[testimonial.title, testimonial.company].filter(Boolean).join(" · ")}</small>
                        )}
                      </p>
                    </div>
                  </article>
                ))}
              </Carousel>
            )}
          </Reveal>

          <Reveal as="section" className="feed-card contact-feed" id="contact">
            <div className="contact-intro"><span className="eyebrow">Contact</span><h2>Let&apos;s build something useful.</h2><p>Share the role, product, problem, or collaboration you have in mind. Your message is stored securely, and you can also reach me directly by email.</p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a></div>
            <ContactForm />
          </Reveal>
        </div>

        <aside className="side-column">
          <Reveal as="section" className="side-card open-card" from="right"><span className="side-icon">◎</span><h3>Open to work</h3><p>Full Stack Engineer, AI Engineer, Agentic AI, or a role combining all three.</p><a href={`mailto:${CONTACT_EMAIL}`}>Start a conversation</a></Reveal>
          <Reveal as="section" className="side-card" from="right" delay={0.05}><h3>Current</h3><div className="side-role"><span className="has-mark"><Image src="/logos/snorkel-ai.png" alt="Snorkel AI logo" width={34} height={34} /></span><p><strong>AI Expert</strong><small><a className="company-link" href="https://www.linkedin.com/company/snorkel-ai/" target="_blank" rel="noreferrer">Snorkel AI ↗</a> · Since July 2026</small></p></div><div className="side-role"><span className="has-mark"><Image src="/logos/outlier.svg" alt="Outlier logo" width={34} height={34} /></span><p><strong>AI Engineer &amp; Trainer</strong><small><a className="company-link" href="https://www.linkedin.com/company/try-outlier/" target="_blank" rel="noreferrer">Outlier ↗</a> · Remote</small></p></div></Reveal>
          <Reveal as="section" className="side-card" from="right" delay={0.1}><h3>Education</h3><div className="education-mark has-mark"><Image src="/logos/ggv-crest.png" alt="Guru Ghasidas Vishwavidyalaya crest" width={56} height={56} /></div><strong>B.Tech, Information Technology</strong><p><a className="company-link" href="https://ggu.ac.in/index" target="_blank" rel="noreferrer">Guru Ghasidas Vishwavidyalaya ↗</a><br />2022 - 2026 · Bilaspur</p></Reveal>
          <Reveal as="section" className="side-card resume-card" from="right" delay={0.15}><span>PDF · 1 page</span><h3>Recruiter-ready resume</h3><p>Experience, technical stack, product highlights, and education in one download.</p><a href={RESUME_PATH} download>Download resume ↓</a></Reveal>
          <Reveal as="section" className="side-card ask-card" from="right" delay={0.2}><span>✦</span><h3>Short on time?</h3><p>Use the resume chatbot in the corner and ask about skills, projects, or experience.</p></Reveal>
        </aside>
      </div>

      <footer className="social-footer page-shell"><div><span className="footer-photo"><ProfileAvatar size={44} /></span><p><strong>Raghunandan Kumar</strong><small>Full Stack &amp; Agentic AI Engineer</small></p></div><nav><a href="#about">About</a><Link href="/projects">Projects</Link><a href="#experience">Experience</a><a href="#contact">Contact</a></nav><p>© 2026 · Designed and developed by Raghunandan Kumar</p></footer>
    </main>
  );
}
