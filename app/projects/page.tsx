import type { Metadata } from "next";
import { ProjectBento } from "../components/ProjectBento";
import { ProjectsHero } from "../components/ProjectsHero";
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

const RESUME_PATH = "/resume/raghunandan-kumar-resume.pdf";

export default function ProjectsPage() {
  return (
    <main className="projects-page page-shell">
      <ProjectsHero projects={projects} stats={stats} resumePath={RESUME_PATH} />

      <ProjectBento projects={projects} />

      <Reveal as="section" className="projects-cta" from="up">
        <span>Have a relevant engineering problem?</span>
        <h2>Let&apos;s compare notes.</h2>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL} ↗</a>
      </Reveal>
    </main>
  );
}
