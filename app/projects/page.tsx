import type { Metadata } from "next";
import Link from "next/link";
import { ProjectMedia } from "../components/ProjectMedia";
import { Reveal, RevealGroup, RevealItem } from "../components/Reveal";
import { projects } from "../data/portfolio";
import { CONTACT_EMAIL } from "@/lib/site";

const description =
  "Case studies for Raghunandan Kumar's agentic AI and full-stack products.";

// The root layout's title template appends "| Raghunandan Kumar".
export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects | Raghunandan Kumar",
    description,
    url: "/projects",
    type: "website",
  },
};

export default function ProjectsPage() {
  return (
    <main className="projects-page page-shell">
      <Reveal as="section" className="projects-hero" from="scale" amount={0.05}>
        <span className="eyebrow">Product archive · 2025-2026</span>
        <h1>Three products.<br /><em>Three difficult problems.</em></h1>
        <p>Full case studies covering the problem, system design, core engineering decisions, stack, working product, source code, and an embedded on-site demo area.</p>
        <div><a className="primary-action" href="#case-studies">Explore case studies ↓</a><a className="outline-action" href="/resume/raghunandan-kumar-resume.pdf" download>Download resume</a></div>
      </Reveal>
      <RevealGroup className="project-archive" stagger={0.12}>
        <div id="case-studies" />
        {projects.map((project, index) => (
          <RevealItem className={`archive-card ${project.accent}`} key={project.slug} as="article" from={index % 2 === 0 ? "left" : "right"}>
            <div className="archive-index">0{index + 1}</div>
            <ProjectMedia project={project} compact />
            <div className="archive-copy">
              <span>{project.category}</span>
              <h2>{project.title}</h2>
              <p>{project.summary}</p>
              <div>{project.stack.slice(0, 5).map((item) => <i key={item}>{item}</i>)}</div>
              <Link href={`/projects/${project.slug}`}>Read complete case study <b>↗</b></Link>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal as="section" className="projects-cta" from="up"><span>Have a relevant engineering problem?</span><h2>Let&apos;s compare notes.</h2><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a></Reveal>
    </main>
  );
}
