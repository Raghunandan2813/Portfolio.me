import type { Metadata } from "next";
import { ProjectBento } from "../components/ProjectBento";
import { Reveal } from "../components/Reveal";
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

const stats = [
  { value: "3", label: "shipped products" },
  { value: "20+", label: "technologies" },
  { value: "2", label: "demo walkthroughs" },
];

export default function ProjectsPage() {
  return (
    <main className="projects-page page-shell">
      <Reveal as="section" className="projects-hero" from="scale" amount={0.05}>
        <span className="eyebrow">Product archive · 2025-2026</span>
        <h1>
          Three products.
          <br />
          <em>Three difficult problems.</em>
        </h1>
        <p>
          Full case studies covering the problem, system design, core engineering
          decisions, stack, working product, source code, and an embedded on-site
          demo.
        </p>
        <div>
          <a className="primary-action" href="#case-studies">
            Explore case studies ↓
          </a>
          <a
            className="outline-action"
            href="/resume/raghunandan-kumar-resume.pdf"
            download
          >
            Download resume
          </a>
        </div>
        <div className="hero-stats">
          {stats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <ProjectBento projects={projects} />

      <Reveal as="section" className="projects-cta" from="up">
        <span>Have a relevant engineering problem?</span>
        <h2>Let&apos;s compare notes.</h2>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a>
      </Reveal>
    </main>
  );
}
