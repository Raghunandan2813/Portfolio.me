import type { Metadata } from "next";
import { ProjectBento } from "../components/ProjectBento";
import { ProjectsHero } from "../components/ProjectsHero";
import { Reveal } from "../components/Reveal";
import { listProjects } from "@/lib/projects";
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

const RESUME_PATH = "/resume/raghunandan-kumar-resume.pdf";

export default async function ProjectsPage() {
  const projects = await listProjects();

  // Counted from the live list rather than written down, so adding or hiding a
  // project cannot leave the hero contradicting the page under it.
  const stats = [
    { value: String(projects.length), label: "shipped products" },
    { value: `${new Set(projects.flatMap((project) => project.stack)).size}+`, label: "technologies" },
    {
      value: String(projects.filter((project) => project.demoVideo).length),
      label: "demo walkthroughs",
    },
  ];

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
